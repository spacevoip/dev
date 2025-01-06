import { supabase } from './supabase';
import bcrypt from 'bcryptjs';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  created_at: Date;
  last_login: Date | null;
  accountid: string;
  plano: string;
  contato: string;
  documento: string;
}

export interface UserWithPassword extends User {
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  contato: string;
  documento: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

// Função para gerar accountid no formato SPCVOIPXXXX
function generateAccountId(): string {
  // Gera um número aleatório de 4 dígitos
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  return `SPCVOIP${randomNum}`;
}

// Função para verificar se o accountId já existe
async function isAccountIdUnique(accountId: string): Promise<boolean> {
  const { data } = await supabase
    .from('users')
    .select('accountid')
    .eq('accountid', accountId)
    .single();
  
  return !data; // retorna true se não existir
}

// Função para gerar um accountId único
async function generateUniqueAccountId(): Promise<string> {
  let accountId = generateAccountId();
  let isUnique = await isAccountIdUnique(accountId);
  
  // Tenta até 10 vezes para evitar loop infinito
  let attempts = 0;
  while (!isUnique && attempts < 10) {
    accountId = generateAccountId();
    isUnique = await isAccountIdUnique(accountId);
    attempts++;
  }
  
  if (!isUnique) {
    throw new Error('Não foi possível gerar um accountId único');
  }
  
  return accountId;
}

export const register = async (data: RegisterData): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Validações
    if (data.name.length > 100) {
      return { user: null, error: 'Nome deve ter no máximo 100 caracteres' };
    }

    if (data.email.length > 100) {
      return { user: null, error: 'Email deve ter no máximo 100 caracteres' };
    }

    // Verifica se o email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', data.email)
      .single();

    if (existingUser) {
      return { user: null, error: 'Email já cadastrado' };
    }

    // Gera um accountId único
    const accountId = await generateUniqueAccountId();

    // Cria hash da senha
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Cria novo usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        {
          name: data.name.substring(0, 100),
          email: data.email.substring(0, 100),
          contato: data.contato.substring(0, 20),
          documento: data.documento.substring(0, 20),
          password: hashedPassword.substring(0, 100),
          role: 'user',
          status: 'ativo',
          plano: 'Sip Trial',
          created_at: new Date().toISOString(),
          last_login: null,
          accountid: accountId,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return { user: newUser as User, error: null };
  } catch (err) {
    console.error('Erro no registro:', err);
    return { user: null, error: 'Erro ao criar conta' };
  }
};

export const login = async (data: LoginData): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Busca usuário pelo email
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, email, role, status, created_at, last_login, accountid, plano, contato, documento, password')
      .eq('email', data.email)
      .single();

    if (error || !user) {
      return { user: null, error: 'Usuário não encontrado' };
    }

    // Verifica se o status está ativo
    if (!user.status?.toLowerCase().includes('ativo')) {
      return { user: null, error: 'Conta inativa' };
    }

    // Verifica a senha
    const validPassword = await bcrypt.compare(data.password, user.password);
    
    if (!validPassword) {
      return { user: null, error: 'Senha incorreta' };
    }

    // Atualiza último login
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      return { user: null, error: 'Erro ao atualizar último login' };
    }

    // Remove o campo password antes de retornar
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err.message : 'Erro ao fazer login' };
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      return JSON.parse(savedUser);
    }
    return null;
  } catch (err) {
    console.error('Erro ao buscar usuário atual:', err);
    return null;
  }
};

export const logout = async (): Promise<void> => {
  try {
    // Faz logout no Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    
    // Limpa o localStorage
    localStorage.clear();

    // Limpa os cookies de sessão
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
  } catch (err) {
    console.error('Erro ao fazer logout:', err);
    throw err;
  }
};
