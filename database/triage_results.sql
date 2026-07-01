CREATE TABLE IF NOT EXISTS public.triage_results (
    id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    resultado    VARCHAR(10) NOT NULL CHECK (resultado IN ('apto', 'no_apto')),
    -- JSONB para guardar las respuestas individuales sin columnas extra
    -- Ejemplo: { "edad": true, "peso": true, "tatuajes": false, "fiebre": false, "alcohol": false }
    respuestas   JSONB       NOT NULL DEFAULT '{}',
    -- Motivo de rechazo (null si apto)
    motivo_rechazo TEXT,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índice para consulta rápida del último triage de un usuario
CREATE INDEX IF NOT EXISTS idx_triage_results_usuario_id
  ON public.triage_results (usuario_id, created_at DESC);

-- 3. Habilitar RLS
ALTER TABLE public.triage_results ENABLE ROW LEVEL SECURITY;

-- 4. Política de SELECT: cada usuario solo ve sus propios resultados
DROP POLICY IF EXISTS "triage_select_own" ON public.triage_results;
CREATE POLICY "triage_select_own"
  ON public.triage_results
  FOR SELECT
  USING (auth.uid() = usuario_id);

-- 5. Política de INSERT: solo puede insertar para sí mismo
DROP POLICY IF EXISTS "triage_insert_own" ON public.triage_results;
CREATE POLICY "triage_insert_own"
  ON public.triage_results
  FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- 6. Comentario de documentación
COMMENT ON TABLE public.triage_results IS
  'Historial de pre-triages completados por los usuarios donantes. Un usuario puede tener múltiples registros; el más reciente determina su aptitud actual.';
