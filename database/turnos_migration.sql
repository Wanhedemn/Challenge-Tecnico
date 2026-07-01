-- 1. Recrear turnos con la columna centro_id
DROP TABLE IF EXISTS public.turnos CASCADE;

CREATE TABLE IF NOT EXISTS public.turnos (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id      UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    centro_id       UUID        NOT NULL REFERENCES public.centros_donacion(id) ON DELETE CASCADE,
    -- Fecha y hora del turno elegida por el usuario
    fecha_turno     TIMESTAMPTZ NOT NULL,
    -- Estado del turno en el sistema
    estado          VARCHAR(20) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'confirmado', 'cancelado')),
    -- Estado del pre-triage al momento de la reserva (snapshot)
    estado_triage   VARCHAR(10) NOT NULL DEFAULT 'pendiente'
                    CHECK (estado_triage IN ('pendiente', 'aprobado')),
    -- Notas opcionales del usuario
    notas           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índices
CREATE INDEX IF NOT EXISTS idx_turnos_usuario_id  ON public.turnos (usuario_id, fecha_turno DESC);
CREATE INDEX IF NOT EXISTS idx_turnos_centro_id   ON public.turnos (centro_id);
CREATE INDEX IF NOT EXISTS idx_turnos_fecha_turno ON public.turnos (fecha_turno);

-- 3. RLS
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede ver sus propios turnos
DROP POLICY IF EXISTS "turnos_select_own" ON public.turnos;
CREATE POLICY "turnos_select_own"
  ON public.turnos FOR SELECT
  USING (auth.uid() = usuario_id);

-- Cada usuario solo puede insertar turnos para sí mismo
DROP POLICY IF EXISTS "turnos_insert_own" ON public.turnos;
CREATE POLICY "turnos_insert_own"
  ON public.turnos FOR INSERT
  WITH CHECK (auth.uid() = usuario_id);

-- Cada usuario puede cancelar sus propios turnos
DROP POLICY IF EXISTS "turnos_update_own" ON public.turnos;
CREATE POLICY "turnos_update_own"
  ON public.turnos FOR UPDATE
  USING (auth.uid() = usuario_id)
  WITH CHECK (auth.uid() = usuario_id);

-- 4. Comentario
COMMENT ON TABLE public.turnos IS
  'Reservas de turnos de donación. Vincula un usuario autenticado con un centro de donación en una fecha/hora específica.';
