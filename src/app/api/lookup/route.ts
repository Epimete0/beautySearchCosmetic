import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { ProductoParcial } from '@/lib/types';

interface OpenFactsProduct {
  code?: string;
  id?: string;
  product_name?: string;
  product_name_es?: string;
  categories?: string;
  categories_es?: string;
  brands?: string;
  quantity?: string;
  quantity_es?: string;
  image_url?: string;
  image_front_url?: string;
  [key: string]: unknown;
}

interface OpenFactsResponse {
  status?: number;
  product?: OpenFactsProduct;
  [key: string]: unknown;
}

async function fetchFromOpenFacts(barcode: string, domain: string): Promise<OpenFactsResponse> {
  const url = `https://${domain}/api/v2/product/${barcode}.json?lc=es&cc=cl`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'BeautySearchApp - Web - Version 1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching from ${domain}`);
  }

  return response.json();
}

function processOpenFactsResponse(
  json: OpenFactsResponse,
  sourceName: 'open_beauty_facts' | 'open_food_facts'
): { data: ProductoParcial; source: 'open_beauty_facts' | 'open_food_facts' } | null {
  if (json.status !== 1 || !json.product) {
    return null;
  }

  const p = json.product;

  const hasEsName = Boolean(p.product_name_es);
  const hasEsCategory = Boolean(p.categories_es);

  const nombre = p.product_name_es || p.product_name || null;
  const categoria = p.categories_es || p.categories || null;
  const marca = p.brands || null;
  const cantidad = p.quantity || p.quantity_es || null;
  const imagen_url = p.image_url || p.image_front_url || null;

  const traduccion_pendiente = (!hasEsName && Boolean(p.product_name)) || (!hasEsCategory && Boolean(p.categories));

  return {
    source: sourceName,
    data: {
      barcode: p.code || p.id || '',
      nombre,
      marca,
      submarca: null,
      categoria,
      cantidad,
      imagen_url,
      fuente: sourceName,
      respuesta_cruda: json as Record<string, unknown>,
      traduccion_pendiente,
    },
  };
}

export async function POST(request: Request) {
  try {
    const { barcode } = await request.json();

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // 1. Check local DB
    if (isSupabaseConfigured) {
      const { data: localData } = await supabase
        .from('productos')
        .select('*')
        .eq('barcode', barcode)
        .single();

      if (localData) {
        await supabase.from('historial_escaneos').insert({
          barcode,
          encontrado: true,
          producto_id: localData.id,
        });

        return NextResponse.json({
          found: true,
          source: 'local',
          data: localData,
        });
      }
    }

    // 2. Open Beauty Facts
    let externalMatch = null;
    try {
      const obfJson = await fetchFromOpenFacts(barcode, 'world.openbeautyfacts.org');
      externalMatch = processOpenFactsResponse(obfJson, 'open_beauty_facts');
    } catch (e) {
      console.error('Error with OBF:', e);
    }

    // 3. Open Food Facts (fallback)
    if (!externalMatch) {
      try {
        const offJson = await fetchFromOpenFacts(barcode, 'world.openfoodfacts.org');
        externalMatch = processOpenFactsResponse(offJson, 'open_food_facts');
      } catch (e) {
        console.error('Error with OFF:', e);
      }
    }

    // 4 & 5. Save history & return
    if (externalMatch) {
      if (isSupabaseConfigured) {
        await supabase.from('historial_escaneos').insert({
          barcode,
          encontrado: true,
          producto_id: null,
        });
      }

      return NextResponse.json({
        found: true,
        source: externalMatch.source,
        data: externalMatch.data,
      });
    }

    // No match found anywhere
    if (isSupabaseConfigured) {
      await supabase.from('historial_escaneos').insert({
        barcode,
        encontrado: false,
        producto_id: null,
      });
    }

    return NextResponse.json({
      found: false,
      source: null,
      data: null,
    });
  } catch (error: unknown) {
    console.error('Lookup Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
