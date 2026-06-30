CREATE TABLE IF NOT EXISTS public.centros_donacion (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre              VARCHAR(255) NOT NULL,
    descripcion         TEXT,
    direccion           VARCHAR(255) NOT NULL,
    telefono            VARCHAR(50),
    horario             VARCHAR(255),
    latitud             DECIMAL(9,6) NOT NULL,
    longitud            DECIMAL(9,6) NOT NULL,
    grupos_compatibles  TEXT[]       NOT NULL DEFAULT '{}',
    activo              BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Índice para filtrado eficiente por grupo sanguíneo (usando GIN sobre arrays)
CREATE INDEX IF NOT EXISTS idx_centros_grupos_compat
  ON public.centros_donacion USING GIN (grupos_compatibles);

-- 3. Habilitar RLS
ALTER TABLE public.centros_donacion ENABLE ROW LEVEL SECURITY;

-- 4. Política: cualquier usuario autenticado puede VER los centros activos
DROP POLICY IF EXISTS "centros_select_authenticated" ON public.centros_donacion;
CREATE POLICY "centros_select_authenticated"
  ON public.centros_donacion
  FOR SELECT
  TO authenticated           -- solo usuarios con sesión activa
  USING (activo = true);

-- 5. Comentario
COMMENT ON TABLE public.centros_donacion IS
  'Centros de donación de sangre en la red hospitalaria. El array grupos_compatibles determina qué tipos de sangre acepta cada centro.';

INSERT INTO public.centros_donacion
  (nombre, descripcion, direccion, telefono, horario, latitud, longitud, grupos_compatibles)
VALUES
  (
    'Hospital Italiano de Buenos Aires',
    'Centro de hemoterapia del Hospital Italiano. Cuenta con equipamiento de última generación para la transfusión y procesamiento de sangre.',
    'Gascón 450, Almagro, Buenos Aires',
    '011 4959-0200',
    'Lunes a Viernes 7:00 - 13:00',
    -34.606530,
    -58.428900,
    ARRAY['A+', 'A-', 'O+', 'O-', 'AB+']
  ),
  (
    'Hospital General de Agudos Dr. Ramos Mejía',
    'Banco de sangre público con atención inmediata para urgencias. Acepta donantes de todos los grupos con turno previo.',
    'Gral. Urquiza 609, Balvanera, Buenos Aires',
    '011 4127-0200',
    'Lunes a Sábado 8:00 - 14:00',
    -34.614500,
    -58.408900,
    ARRAY['A+', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']
  ),
  (
    'Centro Regional de Hemoterapia del GCBA',
    'Centro de referencia de la Ciudad de Buenos Aires. Especializado en componentes sanguíneos para pacientes pediátricos y oncológicos.',
    'Combatientes de Malvinas 3002, Núñez, Buenos Aires',
    '011 4704-0200',
    'Lunes a Viernes 7:30 - 12:30',
    -34.545200,
    -58.462100,
    ARRAY['A-', 'B-', 'O-', 'AB-']
  );
