import Link from 'next/link';
import { ScanLine } from 'lucide-react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export const revalidate = 0;

async function getDashboardData() {
  if (!isSupabaseConfigured) {
    return { total: 0, recientes: [] };
  }

  try {
    const { count, error: countError } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });

    const { data: recientes, error: recentError } = await supabase
      .from('productos')
      .select('id, nombre, marca, barcode, created_at')
      .order('created_at', { ascending: false })
      .limit(4);

    return {
      total: countError ? 0 : count ?? 0,
      recientes: recentError || !recientes ? [] : recientes,
    };
  } catch {
    return { total: 0, recientes: [] };
  }
}

export default async function HomePage() {
  const { total, recientes } = await getDashboardData();

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 pt-8 md:pt-12">
      {/* Hero: Total cataloged products */}
      <section className="mb-8">
        <div className="font-headline font-bold text-6xl md:text-7xl text-[#211B26] tracking-tight leading-none">
          {total}
        </div>
        <p className="text-[#8A8580] text-sm font-body mt-2">
          {total === 1 ? 'producto en catálogo' : 'productos en catálogo'}
        </p>
      </section>

      {/* Primary Action CTA */}
      <section className="mb-10">
        <Link
          href="/scan"
          className="w-full flex items-center justify-center gap-3 bg-[#2F6F62] active:bg-[#26594e] text-white py-4 px-6 rounded-lg font-headline font-semibold text-base transition-colors"
        >
          <ScanLine className="w-5 h-5" strokeWidth={2.2} />
          <span>Escanear producto</span>
        </Link>
      </section>

      {/* Recent Activity: Simple Divider List */}
      <section>
        <div className="flex items-center justify-between pb-3 border-b border-[#E4E0E6] mb-1">
          <h2 className="font-headline font-semibold text-sm text-[#211B26]">
            Últimos registros
          </h2>
          <div className="flex items-center gap-3">
            <Link
              href="/estadisticas"
              className="text-xs font-body text-[#8A8580] hover:underline"
            >
              Estadísticas
            </Link>
            {recientes.length > 0 && (
              <Link
                href="/productos"
                className="text-xs font-body text-[#2F6F62] hover:underline"
              >
                Ver todos
              </Link>
            )}
          </div>
        </div>

        {recientes.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#8A8580] font-body">
            No hay productos registrados aún.
          </div>
        ) : (
          <div className="divide-y divide-[#E4E0E6]">
            {recientes.map((prod) => (
              <Link
                key={prod.id}
                href={`/productos/${prod.id}`}
                className="py-3 flex items-center justify-between gap-3 active:bg-[#E4E0E6]/30 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-body text-sm font-medium text-[#211B26] truncate">
                    {prod.nombre || 'Sin nombre'}
                  </div>
                  <div className="font-body text-xs text-[#8A8580] truncate mt-0.5">
                    {prod.marca || 'Marca no especificada'}
                  </div>
                </div>
                <div className="font-mono text-xs text-[#8A8580] shrink-0 text-right tracking-tight">
                  {prod.barcode}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
