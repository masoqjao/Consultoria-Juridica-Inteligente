import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Previne travamentos caso as chaves não estejam configuradas de imediato nesta fase de infraestrutura
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Avisos de Infraestrutura: As chaves do Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY) não foram localizadas nas variáveis de ambiente. Defina-as em seu arquivo .env para ativar a nuvem nas próximas fases.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
