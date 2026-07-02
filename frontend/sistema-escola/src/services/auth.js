import axios from 'axios';
import api from './api';

export const authService = {
  async login(identifier, password) {
    try {
      const response = await axios.post('http://localhost:1337/api/auth/local', {
        identifier,
        password,
      }, {
        headers: { 'Content-Type': 'application/json' }
      });

      const { jwt, user } = response.data;

      if (jwt) {
        localStorage.setItem('token', jwt);
        try {
          const profile = await authService.obterPerfil(user.id);
          localStorage.setItem('user', JSON.stringify(profile));
          return { jwt, user: profile };
        } catch (profileErr) {
          console.error('Me error:', profileErr);
          localStorage.setItem('user', JSON.stringify(user));
        }
      }

      return { jwt, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao fazer login');
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async register(username, email, password, escolaId) {
    try {
      const response = await api.post('/auth/local/register', {
        username,
        email,
        password,
        escola: escolaId,
      });

      const { jwt, user } = response.data;

      if (jwt) {
        localStorage.setItem('token', jwt);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return { jwt, user };
    } catch (error) {
      console.error('Registration error:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao cadastrar o usuário');
    }
  },

  async atualizar(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao atualizar o usuário');
    }
  },

async criarSecretaria(username, email, password, escolaId) {
  try {
    const response = await api.post('/users', {
      username,
      email,
      password,
      cargo: 'secretaria',
      confirmed: true,
      role: 1
    });

    const novoUserId = response.data.id;

    // 2. Atualiza com a escola separadamente
    const putResponse = await api.put(`/users/${novoUserId}`, {
      escola: Number(escolaId)
    });
    
    console.log('PUT escola response:', putResponse.data);

    return response.data;
  } catch (error) {
    console.error('Error creating secretary:', error);
    throw error.response?.data?.error || new Error('Ocorreu um erro ao criar a secretaria');
  }
},

async listarSecretarias(escolaId) {
  try {
    const response = await api.get(`/users?filters[cargo][$eq]=secretaria`);
    return response.data;
  } catch (error) {
    console.error('Error listing secretaries:', error);
    throw error.response?.data?.error || new Error('Ocorreu um erro ao listar as secretarias');
  }
},

  async deletarSecretaria(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting secretary:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao deletar a secretaria');
    }
  },

  async obterPerfil(id) {
    try {
      const response = await api.get(`/users/${id}?populate=*`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error.response?.data?.error || new Error('Erro ao obter perfil do usuário');
    }
  },

  async criarResponsavel(username, email, password, escolaId) {
    try {
      const response = await api.post('/users', {
        username,
        email,
        password,
        cargo: 'responsavel',
        confirmed: true,
        role: 1
      });

      const novoUserId = response.data.id;

      // 2. Atualiza com a escola separadamente
      const putResponse = await api.put(`/users/${novoUserId}`, {
        escola: Number(escolaId)
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating responsible user:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao criar o responsável');
    }
  }
};