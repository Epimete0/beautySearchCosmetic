import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { barcode: string } }
) {
  try {
    const { barcode } = params;

    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('barcode', barcode)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error: unknown) {
    console.error('Error in GET /api/productos/[barcode]:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
