-- =========================================================================
-- DonaVida — Migración: Autenticación con Supabase Auth
-- Ejecutar en Supabase → SQL Editor (en este orden exacto)
-- =========================================================================

-- PASO 1: Ajustar public.usuarios para que el id referencie auth.users
-- Nota: Si la tabla ya tiene datos, primero vaciala o adaptá la migración.
ALTER TABLE public.usuarios
  DROP CONSTRAINT IF EXISTS usuarios_pkey;

ALTER TABLE public.usuarios
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.usuarios
  ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id),
  ADD CONSTRAINT usuarios_id_fkey
      FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- PASO 2: Función del Trigger (SECURITY DEFINER para que corra como superusuario)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.usuarios (id, nombre, email, grupo_sanguineo)
  VALUES (
    NEW.id,
    -- Los metadatos extra se pasan desde el frontend en options.data
    COALESCE(NEW.raw_user_meta_data ->> 'nombre', 'Sin nombre'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'grupo_sanguineo', 'O+')
  );
  RETURN NEW;
END;
$$;

-- PASO 3: Crear el Trigger sobre auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- PASO 4: Habilitar RLS en public.usuarios (si no está habilitado)
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- Política: cada usuario solo puede leer su propia fila
DROP POLICY IF EXISTS "usuarios_select_own" ON public.usuarios;
CREATE POLICY "usuarios_select_own"
  ON public.usuarios
  FOR SELECT
  USING (auth.uid() = id);

-- Política: el trigger (SECURITY DEFINER) maneja el INSERT,
-- pero dejamos una política permisiva para que el service_role también pueda operar
DROP POLICY IF EXISTS "usuarios_insert_service" ON public.usuarios;
CREATE POLICY "usuarios_insert_service"
  ON public.usuarios
  FOR INSERT
  WITH CHECK (true);

-- PASO 5: Política RLS para public.urgencias (lectura pública de urgencias activas)
ALTER TABLE public.urgencias ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "urgencias_select_publico" ON public.urgencias;
CREATE POLICY "urgencias_select_publico"
  ON public.urgencias
  FOR SELECT
  USING (estado = true);

-- PASO 6: Política RLS para public.turnos (cada usuario ve solo sus turnos)
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "turnos_select_own" ON public.turnos;
CREATE POLICY "turnos_select_own"
  ON public.turnos
  FOR SELECT
  USING (auth.uid() = usuario_id);

DROP POLICY IF EXISTS "turnos_insert_own" ON public.turnos;
CREATE POLICY "turnos_insert_own"
  ON public.turnos
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);
