/**
 * lib/supabase.js — Cliente Supabase para uso CLIENT-SIDE (browser).
 *
 * ANTES: usaba createClient de @supabase/supabase-js, que persiste la sesión
 *        en localStorage → INVISIBLE para el middleware de Next.js (Edge Runtime).
 *
 * AHORA: usa createBrowserClient de @supabase/ssr, que persiste la sesión
 *        en COOKIES → legibles tanto en el browser como en el middleware.
 *
 * Todos los imports existentes (`import { supabase } from '@/lib/supabase'`)
 * siguen funcionando sin ningún cambio.
 */
import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl     = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Faltan las variables de entorno de Supabase. Revisa tu archivo .env: ' +
    'NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY'
  );
}

/**
 * Singleton del cliente de Supabase para el browser.
 * createBrowserClient maneja automáticamente la sincronización
 * de cookies entre el cliente y el servidor.
 */
export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);