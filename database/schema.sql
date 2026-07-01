CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla de Usuarios
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    grupo_sanguineo VARCHAR(5) NOT NULL CHECK (grupo_sanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    fecha_registro TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabla de Urgencias (Campañas de Hospitales)
CREATE TABLE IF NOT EXISTS public.urgencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hospital_nombre VARCHAR(255) NOT NULL,
    grupo_sanguineo_requerido VARCHAR(5) NOT NULL CHECK (grupo_sanguineo_requerido IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
    estado BOOLEAN NOT NULL DEFAULT TRUE, -- TRUE: Activa, FALSE: Inactiva
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabla de Turnos (Tabla Intermedia)
CREATE TABLE IF NOT EXISTS public.turnos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    urgencia_id UUID NOT NULL REFERENCES public.urgencias(id) ON DELETE CASCADE,
    fecha_turno TIMESTAMPTZ NOT NULL,
    estado_triage VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado_triage IN ('pendiente', 'aprobado')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Índices para Optimización de Consultas (Claves Foráneas)
CREATE INDEX IF NOT EXISTS idx_turnos_usuario_id ON public.turnos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_turnos_urgencia_id ON public.turnos(urgencia_id);
CREATE INDEX IF NOT EXISTS idx_usuarios_email ON public.usuarios(email);

-- 5. Comentarios de Documentación
COMMENT ON TABLE public.usuarios IS 'Almacena la información de los donantes registrados en la plataforma.';
COMMENT ON TABLE public.urgencias IS 'Almacena las solicitudes urgentes de donación de sangre publicadas por los hospitales.';
COMMENT ON TABLE public.turnos IS 'Tabla intermedia que registra los turnos reservados por los usuarios para cumplir una urgencia, junto al estado de su pre-triage.';
