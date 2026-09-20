import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ error: 'Supabase no está configurado en .env.local' }, { status: 503 });
    }

    const data = await request.json();

    if (!data.barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // Upsert the product
    const { data: producto, error } = await supabase
      .from('productos')
      .upsert(
        {
          barcode: data.barcode,
          nombre: data.nombre,
          marca: data.marca,
          submarca: data.submarca,
          categoria: data.categoria,
          cantidad: data.cantidad,
          imagen_url: data.imagen_url,
          fuente: data.fuente || 'manual',
          respuesta_cruda: data.respuesta_cruda || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'barcode' }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting producto:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Update historial_escaneos to link to the new product_id
    if (producto) {
      await supabase
        .from('historial_escaneos')
        .update({ producto_id: producto.id })
        .eq('barcode', producto.barcode)
        .is('producto_id', null);
    }

    return NextResponse.json(producto);
  } catch (error: unknown) {
    console.error('Error in POST /api/productos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json([]);
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');

    let dbQuery = supabase.from('productos').select('*').order('created_at', { ascending: false });

    if (query) {
      dbQuery = dbQuery.or(`nombre.ilike.%${query}%,marca.ilike.%${query}%,barcode.ilike.%${query}%`);
    }

    const { data, error } = await dbQuery;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in GET /api/productos:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
