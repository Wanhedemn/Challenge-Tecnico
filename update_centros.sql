-- 1. Agregar la columna imagen_url a la tabla existente (si no existe)
ALTER TABLE public.centros_donacion ADD COLUMN IF NOT EXISTS imagen_url text;

-- 2. Insertar 4 nuevos centros de donación con imágenes reales de Unsplash
INSERT INTO public.centros_donacion
  (nombre, descripcion, direccion, telefono, horario, latitud, longitud, grupos_compatibles, imagen_url)
VALUES
  (
    'Fundación Favaloro',
    'Centro especializado en cardiología y alta complejidad.',
    'Av. Belgrano 1746, Monserrat, CABA',
    '011 4378-1200',
    'Lunes a Viernes 8:00 - 15:00',
    -34.6133,
    -58.3888,
    ARRAY['A+', 'O+', 'O-', 'B+'],
    'https://images.unsplash.com/photo-1587370560942-ad2a04eabb6d?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'Hospital Británico',
    'Atención médica integral e internación de pacientes.',
    'Perdriel 74, Parque Patricios, CABA',
    '011 4309-6400',
    'Lunes a Sábado 7:30 - 13:00',
    -34.6315,
    -58.3881,
    ARRAY['A-', 'B-', 'AB+', 'O+'],
    'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'Hospital Alemán',
    'Hemoterapia y donación voluntaria permanente.',
    'Av. Pueyrredón 1640, Recoleta, CABA',
    '011 4827-7000',
    'Lunes a Viernes 8:00 - 14:00',
    -34.5914,
    -58.4026,
    ARRAY['A+', 'B+', 'O+', 'O-', 'AB-'],
    'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=800'
  ),
  (
    'Sanatorio de la Trinidad',
    'Centro moderno con alta capacidad de recepción de donantes.',
    'Cerviño 4720, Palermo, CABA',
    '011 4127-5500',
    'Lunes a Viernes 8:00 - 16:00',
    -34.5735,
    -58.4239,
    ARRAY['A+', 'O+', 'AB+'],
    'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?auto=format&fit=crop&q=80&w=800'
  );

-- (Opcional) Actualizar un centro existente para que tenga imagen, si lo deseas:
-- UPDATE public.centros_donacion 
-- SET imagen_url = 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?auto=format&fit=crop&q=80&w=800' 
-- WHERE nombre = 'Hospital Italiano de Buenos Aires';
