'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProductoParcial } from '@/lib/types';
import { Loader2, AlertCircle } from 'lucide-react';

export default function ConfirmarPage({ params }: { params: { barcode: string } }) {
  const [formData, setFormData] = useState<ProductoParcial>({
    barcode: params.barcode,
    nombre: '',
    marca: '',
    submarca: '',
    categoria: '',
    cantidad: '',
    imagen_url: '',
    fuente: 'manual',
    respuesta_cruda: null,
    traduccion_pendiente: false,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const raw = sessionStorage.getItem(`lookup_${params.barcode}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.data) {
          setFormData({
            ...parsed.data,
            barcode: params.barcode,
          });
        }
        setSource(parsed.source || null);
      } catch (e) {
        console.error('Error parsing session lookup:', e);
      }
    }
    setLoading(false);
  }, [params.barcode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);

    try {
      const res = await fetch('/api/productos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          // Once reviewed and confirmed by user, pending translation is cleared
          traduccion_pendiente: false,
        }),
      });

      if (res.ok) {
        const saved = await res.json();
        // Clear temporary lookup cache
        sessionStorage.removeItem(`lookup_${params.barcode}`);
        router.push(`/productos/${saved.id}`);
      } else {
        const errData = await res.json().catch(() => ({}));
        setSaveError(errData.error || 'No se pudo guardar el producto.');
        setSaving(false);
      }
    } catch (err: unknown) {
      console.error(err);
      setSaveError('Error de red al guardar. Revisa tu conexión.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-[#8A8580]">
        <Loader2 className="w-7 h-7 animate-spin text-[#2F6F62] mb-2" />
        <span className="font-body text-xs">Cargando datos...</span>
      </div>
    );
  }

  const isPendingTranslation = Boolean(formData.traduccion_pendiente);

  return (
    <div className="max-w-md md:max-w-xl mx-auto px-4 py-6 md:py-10">
      <header className="mb-6">
        <h1 className="font-headline font-bold text-2xl text-[#211B26] tracking-tight">
          Confirmar producto
        </h1>
        <div className="flex items-center gap-2 mt-1">
          <span className="font-body text-xs text-[#8A8580]">Código:</span>
          <span className="font-mono text-xs text-[#211B26] tracking-wider font-semibold">
            {params.barcode}
          </span>
        </div>
      </header>

      {/* Source Status Banner */}
      {source && (
        <div className="mb-6 p-3 bg-[#FFFFFF] border border-[#E4E0E6] rounded text-xs font-body text-[#211B26] flex items-center justify-between">
          <span className="text-[#8A8580]">Fuente de datos:</span>
          <span className="font-medium text-[#2F6F62]">
            {source === 'open_beauty_facts'
              ? 'Open Beauty Facts'
              : 'Open Food Facts'}
          </span>
        </div>
      )}

      {!source && (
        <div className="mb-6 p-3 bg-[#FFFFFF] border border-[#E4E0E6] rounded text-xs font-body text-[#8A8580]">
          Sin coincidencia externa. Completa los datos manualmente.
        </div>
      )}

      {saveError && (
        <div className="mb-6 p-3 bg-[#FFFFFF] border border-[#C98A2C] rounded text-xs font-body text-[#C98A2C] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Product Card Container */}
      <div className="bg-[#FFFFFF] border border-[#E4E0E6] rounded-lg p-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nombre */}
          <div>
            <label className="block font-body text-xs font-medium text-[#211B26] mb-1">
              Nombre del producto *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre || ''}
              onChange={handleChange}
              required
              placeholder="ej. Crema Hidratante Facial"
              className={`w-full bg-[#FFFFFF] rounded px-3 py-2.5 text-sm font-body text-[#211B26] placeholder-[#8A8580] focus:outline-none ${
                isPendingTranslation && formData.nombre
                  ? 'border-2 border-[#C98A2C] focus:ring-1 focus:ring-[#C98A2C]'
                  : 'border border-[#E4E0E6] focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]'
              }`}
            />
            {isPendingTranslation && formData.nombre && (
              <p className="text-[#C98A2C] text-xs font-body mt-1">
                Sin traducción — revisar
              </p>
            )}
          </div>

          {/* Marca */}
          <div>
            <label className="block font-body text-xs font-medium text-[#211B26] mb-1">
              Marca
            </label>
            <input
              type="text"
              name="marca"
              value={formData.marca || ''}
              onChange={handleChange}
              placeholder="ej. Cerave, La Roche-Posay..."
              className="w-full bg-[#FFFFFF] border border-[#E4E0E6] rounded px-3 py-2.5 text-sm font-body text-[#211B26] placeholder-[#8A8580] focus:outline-none focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]"
            />
          </div>

          {/* Submarca */}
          <div>
            <label className="block font-body text-xs font-medium text-[#211B26] mb-1">
              Submarca / Línea
            </label>
            <input
              type="text"
              name="submarca"
              value={formData.submarca || ''}
              onChange={handleChange}
              placeholder="ej. Toleriane, Hydrabio..."
              className="w-full bg-[#FFFFFF] border border-[#E4E0E6] rounded px-3 py-2.5 text-sm font-body text-[#211B26] placeholder-[#8A8580] focus:outline-none focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block font-body text-xs font-medium text-[#211B26] mb-1">
              Categoría
            </label>
            <input
              type="text"
              name="categoria"
              value={formData.categoria || ''}
              onChange={handleChange}
              placeholder="ej. Limpiadores faciales, Fotoprotección..."
              className={`w-full bg-[#FFFFFF] rounded px-3 py-2.5 text-sm font-body text-[#211B26] placeholder-[#8A8580] focus:outline-none ${
                isPendingTranslation && formData.categoria
                  ? 'border-2 border-[#C98A2C] focus:ring-1 focus:ring-[#C98A2C]'
                  : 'border border-[#E4E0E6] focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]'
              }`}
            />
            {isPendingTranslation && formData.categoria && (
              <p className="text-[#C98A2C] text-xs font-body mt-1">
                Sin traducción — revisar
              </p>
            )}
          </div>

          {/* Cantidad */}
          <div>
            <label className="block font-body text-xs font-medium text-[#211B26] mb-1">
              Cantidad / Formato
            </label>
            <input
              type="text"
              name="cantidad"
              value={formData.cantidad || ''}
              onChange={handleChange}
              placeholder="ej. 400ml, 50g"
              className="w-full bg-[#FFFFFF] border border-[#E4E0E6] rounded px-3 py-2.5 text-sm font-body text-[#211B26] placeholder-[#8A8580] focus:outline-none focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]"
            />
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-[#E4E0E6] flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-3 border border-[#E4E0E6] text-[#211B26] rounded font-headline text-sm hover:bg-[#F1EEF2] active:bg-[#E4E0E6] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#2F6F62] active:bg-[#26594e] disabled:opacity-50 text-white py-3 px-4 rounded font-headline font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando...</span>
                </>
              ) : (
                <span>Guardar en catálogo</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
