import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import Link from 'next/link';

export const revalidate = 0;

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getEstadisticas() {
  if (!isSupabaseConfigured) return null;

  try {
    // Total productos en catálogo
    const { count: totalProductos } = await supabase
      .from('productos')
      .select('*', { count: 'exact', head: true });

    // Todos los escaneos — campos que necesitamos
    // Schema: id, barcode, encontrado, source, producto_id, created_at, verificado
    const { data: escaneos, error } = await supabase
      .from('historial_escaneos')
      .select('encontrado, source, verificado');

    if (error || !escaneos) return null;

    const total = escaneos.length;
    if (total === 0) return { empty: true as const };

    const conMatch = escaneos.filter(e => e.encontrado === true).length;
    const sinMatch = escaneos.filter(e => e.encontrado === false).length;
    const pctMatch = Math.round((conMatch / total) * 100);

    // Verificación — tiene sentido sobre los que pasaron por la pantalla
    // de verificación (matches externos). null = no pasó por esa pantalla.
    const confirmados  = escaneos.filter(e => e.verificado === true).length;
    const rechazados   = escaneos.filter(e => e.verificado === false).length;
    const sinVerificar = escaneos.filter(e => e.verificado === null).length;

    // Desglose por fuente
    const porFuente = {
      open_beauty_facts: escaneos.filter(e => e.source === 'open_beauty_facts').length,
      open_food_facts:   escaneos.filter(e => e.source === 'open_food_facts').length,
      local:             escaneos.filter(e => e.source === 'local').length,
      sin_match:         escaneos.filter(e => !e.encontrado).length,
    };

    return {
      empty: false as const,
      totalProductos: totalProductos ?? 0,
      total,
      conMatch,
      sinMatch,
      pctMatch,
      verificados: { confirmados, rechazados, sinVerificar },
      porFuente,
    };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Stat block — hero number + label (mismo lenguaje visual que /inicio)
// ---------------------------------------------------------------------------

function Stat({
  value,
  label,
  dim = false,
}: {
  value: string | number;
  label: string;
  dim?: boolean;
}) {
  return (
    <div>
      <div
        className={`font-headline font-bold tracking-tight leading-none ${
          dim
            ? 'text-4xl md:text-5xl text-[#8A8580]'
            : 'text-5xl md:text-6xl text-[#211B26]'
        }`}
      >
        {value}
      </div>
      <p className="text-[#8A8580] text-sm font-body mt-1.5">{label}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function EstadisticasPage() {
  const data = await getEstadisticas();

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 pt-8 md:pt-12 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-headline font-bold text-2xl text-[#211B26] tracking-tight">
          Estadísticas
        </h1>
        <Link href="/" className="text-xs font-body text-[#2F6F62] hover:underline">
          ← Inicio
        </Link>
      </div>

      {/* Estado vacío / sin config */}
      {(!data || data.empty) && (
        <div className="py-12 text-center text-sm text-[#8A8580] font-body leading-relaxed">
          {!data
            ? 'No se pudo conectar con la base de datos.'
            : 'Todavía no hay suficientes datos — escaneá algunos productos para ver estadísticas acá.'}
        </div>
      )}

      {/* Contenido */}
      {data && !data.empty && (
        <div className="space-y-10">

          {/* Catálogo */}
          <section>
            <Stat value={data.totalProductos} label="productos en catálogo" />
          </section>

          <hr className="border-[#E4E0E6]" />

          {/* Escaneos totales */}
          <section>
            <h2 className="font-headline font-semibold text-xs text-[#8A8580] uppercase tracking-widest mb-6">
              Escaneos
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <Stat value={data.total}           label="escaneos totales" />
              <Stat value={`${data.pctMatch}%`}  label="con match (externo o local)" />
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <Stat value={data.conMatch} label="encontrados" />
              <Stat value={data.sinMatch} label="sin match" dim />
            </div>
          </section>

          <hr className="border-[#E4E0E6]" />

          {/* Desglose por fuente */}
          <section>
            <h2 className="font-headline font-semibold text-xs text-[#8A8580] uppercase tracking-widest mb-6">
              Desglose por fuente
            </h2>
            <div className="grid grid-cols-2 gap-8">
              <Stat
                value={data.porFuente.open_beauty_facts}
                label="Open Beauty Facts"
              />
              <Stat
                value={data.porFuente.open_food_facts}
                label="Open Food Facts"
              />
            </div>
            <div className="grid grid-cols-2 gap-8 mt-8">
              <Stat
                value={data.porFuente.local}
                label="catálogo local"
              />
              <Stat
                value={data.porFuente.sin_match}
                label="sin match en ninguna fuente"
                dim
              />
            </div>
          </section>

          <hr className="border-[#E4E0E6]" />

          {/* Verificación */}
          <section>
            <h2 className="font-headline font-semibold text-xs text-[#8A8580] uppercase tracking-widest mb-6">
              Verificación de matches externos
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <Stat value={data.verificados.confirmados}  label="confirmados correctos" />
              <Stat value={data.verificados.rechazados}   label="rechazados" dim />
              <Stat value={data.verificados.sinVerificar} label="sin verificar" dim />
            </div>
          </section>

        </div>
      )}
    </div>
  );
}
