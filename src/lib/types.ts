export interface Producto {
  id: string;
  barcode: string;
  nombre: string | null;
  marca: string | null;
  submarca: string | null;
  categoria: string | null;
  cantidad: string | null;
  imagen_url: string | null;
  fuente: 'open_beauty_facts' | 'open_food_facts' | 'manual';
  respuesta_cruda: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface ProductoParcial extends Partial<Producto> {
  barcode: string;
  traduccion_pendiente?: boolean;
}

export interface HistorialEscaneo {
  id: string;
  barcode: string;
  encontrado: boolean;
  producto_id: string | null;
  created_at: string;
}
