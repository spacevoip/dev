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
export async function generateUniqueAccountId(): Promise<string> {
  let accountId: string;
  let isUnique = false;

  while (!isUnique) {
    // Gera um novo accountId
    accountId = generateAccountId();

    // Verifica se o accountId é único
    isUnique = await isAccountIdUnique(accountId);
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
    // Busca o usuário pelo email
    const { data: userData } = await supabase
      .from('users')
      .select('*')
      .eq('email', data.email)
      .single();

    // Verifica se o usuário existe
    if (!userData) {
      return { user: null, error: 'Usuário não encontrado' };
    }

    // Verifica o status do usuário
    if (userData.status === 'inativo') {
      // Desconecta todos os dispositivos logados
      await supabase.auth.signOut();
      
      return { 
        user: null, 
        error: 'Conta inativa. Entre em contato com o suporte.' 
      };
    }

    // Verifica a senha
    const isPasswordValid = await bcrypt.compare(data.password, userData.password);
    if (!isPasswordValid) {
      return { user: null, error: 'Senha incorreta' };
    }

    // Atualiza o último login
    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userData.id);

    // Remove a senha antes de retornar
    const { password, ...userWithoutPassword } = userData;

    return { 
      user: userWithoutPassword as User, 
      error: null 
    };
  } catch (error) {
    console.error('Erro no login:', error);
    return { 
      user: null, 
      error: 'Erro inesperado. Tente novamente.' 
    };
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
    // Atualiza o status do usuário para offline no banco de dados
    const user = await getCurrentUser();
    if (user) {
      await supabase
        .from('users')
        .update({ 
          last_logout: new Date().toISOString(),
          status: 'offline'
        })
        .eq('id', user.id);
    }

    // Desconecta de todos os dispositivos
    await supabase.auth.signOut();

    // Limpa o localStorage
    localStorage.removeItem('user');
    localStorage.removeItem('tokenExpiry');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    throw error;
  }
};
