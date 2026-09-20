import { NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured) {
      return NextResponse.json({ ok: true });
    }

    const { barcode, verificado } = await request.json();

    if (!barcode) {
      return NextResponse.json({ error: 'Barcode is required' }, { status: 400 });
    }

    // Find the latest scan record for this barcode where verificado is null
    const { data: latestScan } = await supabase
      .from('historial_escaneos')
      .select('id')
      .eq('barcode', barcode)
      .is('verificado', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestScan?.id) {
      await supabase
        .from('historial_escaneos')
        .update({ verificado: Boolean(verificado) })
        .eq('id', latestScan.id);
    } else {
      // Fallback: update most recent scan for this barcode
      const { data: anyScan } = await supabase
        .from('historial_escaneos')
        .select('id')
        .eq('barcode', barcode)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (anyScan?.id) {
        await supabase
          .from('historial_escaneos')
          .update({ verificado: Boolean(verificado) })
          .eq('id', anyScan.id);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Error in POST /api/verificar:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
