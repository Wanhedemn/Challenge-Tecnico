-- Tabla de urgencias activas para el carrusel del Home
-- Ejecutar en Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.urgencias (
  id              uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  centro_id       uuid REFERENCES public.centros_donacion(id),
  hospital_nombre text        NOT NULL,
  grupo_requerido text        NOT NULL,  -- 'A+', 'O-', etc.
  nivel_urgencia  text        NOT NULL CHECK (nivel_urgencia IN ('Alta', 'Media', 'Baja')),
  imagen_url      text,
  activo          boolean     DEFAULT true,
  created_at      timestamptz DEFAULT now()
);

-- RLS: cualquier usuario autenticado puede listar urgencias activas
ALTER TABLE public.urgencias ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Urgencias visibles para usuarios autenticados"
  ON public.urgencias
  FOR SELECT
  TO authenticated
  USING (activo = true);

-- Script para insertar urgencias usando un centro_id válido
DO $$
DECLARE
  v_centro_id uuid;
BEGIN
  -- Tomamos cualquier centro válido (el primero que exista)
  SELECT id INTO v_centro_id FROM public.centros_donacion LIMIT 1;
  
  IF v_centro_id IS NOT NULL THEN
    INSERT INTO public.urgencias (centro_id, hospital_nombre, grupo_requerido, nivel_urgencia, imagen_url) VALUES
      (v_centro_id, 'Hospital Garrahan',       'O-',  'Alta',  NULL),
      (v_centro_id, 'Clínica Bazterrica',      'A+',  'Alta',  NULL),
      (v_centro_id, 'Hospital Italiano',       'B+',  'Media', NULL),
      (v_centro_id, 'Hospital Fernández',      'AB-', 'Alta',  NULL),
      (v_centro_id, 'Sanatorio Güemes',        'O+',  'Media', NULL),
      (v_centro_id, 'Hospital Álvarez',        'A-',  'Alta',  NULL),
      (v_centro_id, 'Clínica Santa Isabel',    'B-',  'Baja',  NULL),
      (v_centro_id, 'Hospital de Clínicas',    'AB+', 'Media', NULL);
  END IF;
END $$;
