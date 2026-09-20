import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const revalidate = 0;

export default async function ProductoDetallePage({
  params,
}: {
  params: { id: string };
}) {
  if (!isSupabaseConfigured) {
    notFound();
  }

  const { data: producto, error } = await supabase
    .from('productos')
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !producto) {
    notFound();
  }

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-6 md:py-10">
      {/* Top back navigation */}
      <nav className="mb-6">
        <Link
          href="/productos"
          className="text-xs font-body text-[#2F6F62] hover:underline"
        >
          Volver al catálogo
        </Link>
      </nav>

      {/* Product Detail Card */}
      <div className="bg-[#FFFFFF] border border-[#E4E0E6] rounded-lg p-5 md:p-6">
        {/* Product Image (if available) */}
        {producto.imagen_url && (
          <div className="w-full h-44 mb-6 bg-[#FFFFFF] border border-[#E4E0E6] rounded flex items-center justify-center p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={producto.imagen_url}
              alt={producto.nombre || ''}
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        {/* Product Title and Brand */}
        <header className="pb-4 border-b border-[#E4E0E6]">
          <h1 className="font-headline font-bold text-xl md:text-2xl text-[#211B26] tracking-tight">
            {producto.nombre || 'Sin nombre registrado'}
          </h1>
          {producto.marca && (
            <p className="font-body text-sm text-[#8A8580] mt-1">
              {producto.marca} {producto.submarca ? `· ${producto.submarca}` : ''}
            </p>
          )}
        </header>

        {/* Structured Data Rows */}
        <dl className="divide-y divide-[#E4E0E6] font-body text-sm">
          <div className="py-3 flex items-center justify-between gap-4">
            <dt className="text-[#8A8580] text-xs">Código de barras</dt>
            <dd className="font-mono text-xs text-[#211B26] tracking-wider font-semibold">
              {producto.barcode}
            </dd>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <dt className="text-[#8A8580] text-xs">Categoría</dt>
            <dd className="text-[#211B26] text-xs font-medium text-right">
              {producto.categoria || '—'}
            </dd>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <dt className="text-[#8A8580] text-xs">Cantidad / Formato</dt>
            <dd className="text-[#211B26] text-xs font-medium text-right">
              {producto.cantidad || '—'}
            </dd>
          </div>

          <div className="py-3 flex items-center justify-between gap-4">
            <dt className="text-[#8A8580] text-xs">Fuente de registro</dt>
            <dd className="text-[#8A8580] text-xs text-right">
              {producto.fuente === 'open_beauty_facts'
                ? 'Open Beauty Facts'
                : producto.fuente === 'open_food_facts'
                ? 'Open Food Facts'
                : 'Carga manual'}
            </dd>
          </div>
        </dl>

        {/* Actions */}
        <div className="pt-6 mt-2 border-t border-[#E4E0E6] flex gap-3">
          <Link
            href={`/confirmar/${producto.barcode}`}
            className="w-full text-center py-2.5 px-4 border border-[#E4E0E6] bg-[#F1EEF2]/50 hover:bg-[#F1EEF2] active:bg-[#E4E0E6] text-[#211B26] rounded font-headline font-medium text-xs transition-colors"
          >
            Editar datos
          </Link>
        </div>
      </div>
    </div>
  );
}
