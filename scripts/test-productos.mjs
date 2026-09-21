/**
 * scripts/test-productos.mjs
 *
 * Script de cobertura contra /api/lookup.
 * Uso:
 *   npm run test:cobertura                        → apunta a producción
 *   TEST_BASE_URL=http://localhost:3001 npm run test:cobertura
 *
 * Para agregar productos al catálogo de regresión, añadí una entrada al
 * array PRODUCTOS al final del archivo, con nombre y barcode.
 */

// ---------------------------------------------------------------------------
// Configuración
// ---------------------------------------------------------------------------

const BASE_URL = process.env.TEST_BASE_URL ?? 'https://beautysearch.vercel.app';

// ---------------------------------------------------------------------------
// Catálogo de regresión
// Cada entrada: { nombre: string, barcode: string }
// Marcá con  // ⚠️ VERIFICAR DÍGITOS  los barcodes que no vienen de un
// escaneo real (foto poco nítida, digitado a mano, etc.)
// ---------------------------------------------------------------------------

const PRODUCTOS = [
  {
    nombre: 'Head & Shoulders Crece Fuerte 375ml (LatAm/México)',
    barcode: '7500435159210',
  },
  {
    nombre: 'La Roche-Posay Lipikar Baume Light AP+M 400ml',
    barcode: '3337875080378', // ⚠️ VERIFICAR DÍGITOS — lectura de foto poco nítida
  },
];

// ---------------------------------------------------------------------------
// Helper: POST a /api/lookup
// ---------------------------------------------------------------------------

async function lookupBarcode(barcode) {
  const res = await fetch(`${BASE_URL}/api/lookup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ barcode }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }

  return res.json();
}

// ---------------------------------------------------------------------------
// Colores ANSI (se deshabilitan si el terminal no los soporta)
// ---------------------------------------------------------------------------

const c = {
  reset:  '\x1b[0m',
  bold:   '\x1b[1m',
  green:  '\x1b[32m',
  yellow: '\x1b[33m',
  red:    '\x1b[31m',
  cyan:   '\x1b[36m',
  dim:    '\x1b[2m',
};

function col(color, text) {
  return process.stdout.isTTY ? `${c[color]}${text}${c.reset}` : text;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log('');
  console.log(col('bold', `BeautySearch — Test de Cobertura /api/lookup`));
  console.log(col('dim',  `Base URL: ${BASE_URL}`));
  console.log(col('dim',  `Productos a testear: ${PRODUCTOS.length}`));
  console.log('─'.repeat(60));

  let matched = 0;
  let failed  = 0;

  for (const producto of PRODUCTOS) {
    const { nombre, barcode } = producto;
    process.stdout.write(`\n${col('cyan', '▶')} ${nombre}\n`);
    process.stdout.write(`  Barcode: ${col('dim', barcode)}\n`);

    let data;
    try {
      data = await lookupBarcode(barcode);
    } catch (err) {
      failed += 1;
      process.stdout.write(`  ${col('red', '✗ ERROR')} ${err.message}\n`);
      continue;
    }

    const found  = data.found  ?? false;
    const source = data.source ?? null;
    const info   = data.data   ?? {};

    if (found) matched += 1;

    // Match / no-match
    const matchLine = found
      ? col('green', `✓ Match  [source: ${source}]`)
      : col('yellow', `○ Sin match`);
    process.stdout.write(`  ${matchLine}\n`);

    // Datos traídos por la API
    if (info.nombre)  process.stdout.write(`  Nombre API  : ${info.nombre}\n`);
    if (info.marca)   process.stdout.write(`  Marca API   : ${info.marca}\n`);
    if (info.cantidad)process.stdout.write(`  Cantidad    : ${info.cantidad}\n`);

    // Flags adicionales
    if (info.traduccion_pendiente === true) {
      process.stdout.write(`  ${col('yellow', '⚠ traduccion_pendiente: true')}\n`);
    }
    if (info.imagen_url) {
      process.stdout.write(`  Imagen      : ${col('dim', info.imagen_url)}\n`);
    }
  }

  // ---------------------------------------------------------------------------
  // Resumen final
  // ---------------------------------------------------------------------------

  const total   = PRODUCTOS.length;
  const noMatch = total - matched - failed;

  console.log('\n' + '─'.repeat(60));
  console.log(col('bold', 'Resumen'));
  console.log(`  ${col('green',  `${matched}/${total}`)} productos con match`);
  if (noMatch > 0) {
    console.log(`  ${col('yellow', `${noMatch}/${total}`)} productos sin match`);
  }
  if (failed > 0) {
    console.log(`  ${col('red',    `${failed}/${total}`)} requests fallidos (error de red o HTTP no-200)`);
  }
  console.log('');

  // Exit code no-zero si hay fallos de red
  if (failed > 0) process.exit(1);
}

main().catch((err) => {
  console.error('Error inesperado en el script:', err);
  process.exit(2);
});
