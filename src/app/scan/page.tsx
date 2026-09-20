'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { useRouter } from 'next/navigation';
import { Loader2, CameraOff, ArrowRight } from 'lucide-react';

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [loading, setLoading] = useState(false);
  const [detectedCode, setDetectedCode] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualBarcode, setManualBarcode] = useState('');

  const router = useRouter();

  const handleLookup = useCallback(async (barcode: string) => {
    const cleanBarcode = barcode.trim();
    if (!cleanBarcode) return;

    setLoading(true);

    try {
      const res = await fetch('/api/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ barcode: cleanBarcode }),
      });

      const data = await res.json();

      if (res.ok) {
        // If already cataloged locally, go directly to its file
        if (data.source === 'local' && data.data?.id) {
          router.push(`/productos/${data.data.id}`);
          return;
        }

        sessionStorage.setItem(`lookup_${cleanBarcode}`, JSON.stringify(data));
      } else {
        sessionStorage.setItem(
          `lookup_${cleanBarcode}`,
          JSON.stringify({ found: false, source: null, data: null })
        );
      }

      router.push(`/confirmar/${cleanBarcode}`);
    } catch (err: unknown) {
      console.error('Lookup request failed:', err);
      sessionStorage.setItem(
        `lookup_${cleanBarcode}`,
        JSON.stringify({ found: false, source: null, data: null })
      );
      router.push(`/confirmar/${cleanBarcode}`);
    }
  }, [router]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let isActive = true;

    async function startCamera() {
      try {
        setCameraError(null);

        const controls = await codeReader.decodeFromVideoDevice(
          undefined,
          videoRef.current || undefined,
          async (result) => {
            if (result && isActive) {
              const code = result.getText();
              isActive = false;

              if (controlsRef.current) {
                controlsRef.current.stop();
              }

              if (typeof window !== 'undefined' && 'vibrate' in navigator) {
                try {
                  navigator.vibrate(50);
                } catch {
                  // ignore
                }
              }

              setDetectedCode(code);
              await handleLookup(code);
            }
          }
        );

        controlsRef.current = controls;
      } catch (err: unknown) {
        console.error('Camera initialization error:', err);
        const isNotAllowed = err instanceof Error && err.name === 'NotAllowedError';
        setCameraError(
          isNotAllowed
            ? 'Acceso a la cámara denegado. Puedes ingresar el código manualmente abajo.'
            : 'No se pudo iniciar la cámara en este dispositivo.'
        );
      }
    }

    startCamera();

    return () => {
      isActive = false;
      if (controlsRef.current) {
        controlsRef.current.stop();
      }
    };
  }, [handleLookup]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualBarcode.trim()) {
      handleLookup(manualBarcode.trim());
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] md:h-screen bg-[#211B26] overflow-hidden flex flex-col items-center justify-between text-white">
      {/* Background Video Stream */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        muted
        playsInline
      />

      {/* Dark Vignette Overlay for focus */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Top Bar Status */}
      <header className="relative z-10 w-full px-4 pt-6 flex flex-col items-center">
        <span className="font-headline font-semibold text-sm text-white/90">
          Escaneo de código
        </span>
        <span className="font-body text-xs text-white/70 mt-0.5">
          {loading
            ? 'Buscando información...'
            : detectedCode
            ? 'Código detectado'
            : 'Enfoca el código de barras dentro del recuadro'}
        </span>
      </header>

      {/* Viewfinder Target Area */}
      <div className="relative z-10 w-72 h-72 sm:w-80 sm:h-80 my-auto flex items-center justify-center">
        {/* Reticle Corner Marks */}
        <div
          className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 transition-colors duration-200 ${
            detectedCode ? 'border-[#2F6F62]' : 'border-white/80'
          }`}
        />
        <div
          className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 transition-colors duration-200 ${
            detectedCode ? 'border-[#2F6F62]' : 'border-white/80'
          }`}
        />
        <div
          className={`absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 transition-colors duration-200 ${
            detectedCode ? 'border-[#2F6F62]' : 'border-white/80'
          }`}
        />
        <div
          className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 transition-colors duration-200 ${
            detectedCode ? 'border-[#2F6F62]' : 'border-white/80'
          }`}
        />

        {/* Laser Scanning Line */}
        {!detectedCode && !cameraError && (
          <div
            className="absolute left-3 right-3 h-[2px] bg-[#2F6F62] shadow-[0_0_8px_#2F6F62] animate-laser pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Frozen Laser Line on Match */}
        {detectedCode && (
          <div
            className="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[3px] bg-[#2F6F62] shadow-[0_0_12px_#2F6F62] pointer-events-none"
            aria-hidden="true"
          />
        )}

        {/* Loading Spinner */}
        {loading && (
          <div className="flex flex-col items-center bg-black/70 px-4 py-3 rounded border border-white/20">
            <Loader2 className="w-7 h-7 animate-spin text-[#2F6F62] mb-2" />
            <span className="font-headline text-xs font-medium text-white">
              Consultando catálogos...
            </span>
            {detectedCode && (
              <span className="font-mono text-xs text-[#2F6F62] mt-1 tracking-wider">
                {detectedCode}
              </span>
            )}
          </div>
        )}

        {/* Camera Error Fallback Message in Viewfinder */}
        {cameraError && (
          <div className="p-4 bg-black/80 rounded border border-[#C98A2C] text-center max-w-xs">
            <CameraOff className="w-6 h-6 text-[#C98A2C] mx-auto mb-2" />
            <p className="text-xs text-white/90 font-body mb-3">{cameraError}</p>
          </div>
        )}
      </div>

      {/* Bottom Controls: Manual input fallback */}
      <footer className="relative z-10 w-full max-w-sm px-4 pb-6">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="Ingreso manual de código..."
            className="flex-1 bg-white/10 text-white placeholder-white/50 border border-white/20 rounded px-3 py-2.5 font-mono text-xs focus:outline-none focus:border-[#2F6F62] focus:ring-1 focus:ring-[#2F6F62]"
          />
          <button
            type="submit"
            disabled={!manualBarcode.trim() || loading}
            className="bg-[#2F6F62] disabled:opacity-50 text-white px-4 py-2.5 rounded font-headline text-xs font-semibold flex items-center gap-1 active:bg-[#26594e] transition-colors"
          >
            <span>Buscar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>
      </footer>
    </div>
  );
}
