import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

/**
 * Hook customizado para acessar o contexto de autenticação global.
 * @returns O estado do usuário, sessão e métodos de autenticação Supabase.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser utilizado obrigatoriamente dentro de um AuthProvider.');
  }
  return context;
}
