'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Producto } from '@/lib/types';
import { Search, Loader2 } from 'lucide-react';

export default function ProductosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchProductos = useCallback(async (searchQuery: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/productos?query=${encodeURIComponent(searchQuery)}`);
      if (res.ok) {
        const data = await res.json();
        setProductos(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Error fetching productos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchProductos(query);
    }, 250);

    return () => clearTimeout(timeoutId);
  }, [query, fetchProductos]);

  return (
    <div className="max-w-2xl mx-auto min-h-screen">
      {/* Sticky Search Header */}
      <header className="sticky top-0 z-30 bg-[#F1EEF2] border-b border-[#E4E0E6] px-4 py-3">
        <div className="relative">
          <input
            type="search"
            placeholder="Buscar por nombre, marca o código..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E4E0E6] rounded-md py-2.5 pl-9 pr-4 text-sm font-body text-[#211B26] placeholder-[#8A8580] focus:outline-none focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]"
          />
          <Search className="w-4 h-4 text-[#8A8580] absolute left-3 top-3.5" />
        </div>
      </header>

      {/* Catalog Content - Divider List */}
      <div className="px-4">
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-[#8A8580]">
            <Loader2 className="w-6 h-6 animate-spin mb-2 text-[#2F6F62]" />
            <span className="text-xs font-body">Cargando catálogo...</span>
          </div>
        ) : productos.length === 0 ? (
          <div className="py-16 text-center text-[#8A8580] font-body text-sm">
            {query.trim()
              ? 'No se encontraron productos para esta búsqueda.'
              : 'El catálogo está vacío. Comienza escaneando un producto.'}
          </div>
        ) : (
          <div className="divide-y divide-[#E4E0E6]">
            {productos.map((producto) => (
              <Link
                key={producto.id}
                href={`/productos/${producto.id}`}
                className="py-3.5 flex items-center justify-between gap-3 active:bg-[#E4E0E6]/30 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  {/* Small product image if present */}
                  {producto.imagen_url ? (
                    <div className="w-12 h-12 shrink-0 bg-[#FFFFFF] border border-[#E4E0E6] rounded overflow-hidden flex items-center justify-center p-0.5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={producto.imagen_url}
                        alt=""
                        className="w-full h-full object-contain"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 shrink-0 bg-[#E4E0E6]/50 rounded flex items-center justify-center text-[10px] text-[#8A8580] font-body">
                      Sin foto
                    </div>
                  )}

                  {/* Name, Brand and Barcode */}
                  <div className="min-w-0 flex-1">
                    <div className="font-body text-sm font-medium text-[#211B26] truncate">
                      {producto.nombre || 'Sin nombre'}
                    </div>
                    <div className="font-body text-xs text-[#8A8580] truncate mt-0.5">
                      {producto.marca || 'Marca no especificada'}
                    </div>
                    <div className="font-mono text-xs text-[#8A8580] mt-0.5 tracking-tight">
                      {producto.barcode}
                    </div>
                  </div>
                </div>

                {/* Right metadata (Quantity / Category) */}
                {producto.cantidad && (
                  <div className="shrink-0 text-right">
                    <span className="font-body text-xs text-[#8A8580] px-1.5 py-0.5 border border-[#E4E0E6] bg-[#FFFFFF] rounded">
                      {producto.cantidad}
                    </span>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
