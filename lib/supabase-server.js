import { createClient } from '@supabase/supabase-js';

/**
 * supabaseAdmin — Cliente de Supabase exclusivo para uso SERVER-SIDE.
 *
 * Usa la `service_role` key, que:
 *   ✅ Bypasea Row Level Security (RLS) completamente.
 *   ✅ Tiene privilegios de superusuario sobre la DB.
 *   ❌ NUNCA debe estar en el browser ni en código con prefijo NEXT_PUBLIC_.
 *
 * Importar SOLO desde /app/api/** (API Routes) o Server Components.
 * NUNCA importar desde componentes con 'use client'.
 */

const supabaseUrl      = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey   = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Faltan variables de entorno del servidor. ' +
    'Verificá NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en tu .env'
  );
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    // Desactiva la persistencia de sesión: en el servidor no hay cookies de usuario.
    persistSession:     false,
    autoRefreshToken:   false,
    detectSessionInUrl: false,
  },
});
