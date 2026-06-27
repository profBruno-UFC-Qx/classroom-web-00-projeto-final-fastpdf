import api from './api';

export const authService = {
  /**
   * Authenticate a user with email and password via Strapi
   * @param {string} identifier - Email or username
   * @param {string} password - Password
   * @returns {Promise<object>} The user and JWT token data
   */
  async login(identifier, password) {
    try {
      const response = await api.post('/auth/local', {
        identifier,
        password,
      });

      const { jwt, user } = response.data;

      if (jwt) {
        localStorage.setItem('token', jwt);
        try {
          // Fetch full user profile with relations populated
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

  /**
   * Remove token and user data from local storage
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  /**
   * Get current authenticated user details from local storage
   * @returns {object|null} User data
   */
  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if user is authenticated (token exists in local storage)
   * @returns {boolean} True if token exists
   */
  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  /**
   * Register a new user in Strapi (usually linked to a school)
   * @param {string} username - Username
   * @param {string} email - Email address
   * @param {string} password - Password
   * @param {number|string} escolaId - The ID of the school to link the user to
   * @returns {Promise<object>} The registered user and JWT token data
   */
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

  /**
   * Update user details in Strapi (uses flat payload structure)
   * @param {number|string} id - User ID
   * @param {object} userData - Fields to update
   * @returns {Promise<object>} The updated user data
   */
  async atualizar(id, userData) {
    try {
      const response = await api.put(`/users/${id}`, userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao atualizar o usuário');
    }
  },

  /**
   * Register a secretary user in Strapi
   */
  async criarSecretaria(username, email, password, escolaId) {
    try {
      const response = await api.post('/users', {
        username,
        email,
        password,
        escola: escolaId,
        cargo: 'secretaria',
        confirmed: true,
        role: 1
      });
      return response.data;
    } catch (error) {
      console.error('Error creating secretary:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao criar a secretaria');
    }
  },

  /**
   * List all secretary users for a specific school
   */
  async listarSecretarias(escolaId) {
    try {
      const response = await api.get(`/users?filters[escola][id][$eq]=${escolaId}&filters[cargo][$eq]=secretaria`);
      return response.data;
    } catch (error) {
      console.error('Error listing secretaries:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao listar as secretarias');
    }
  },

  /**
   * Delete a secretary user
   */
  async deletarSecretaria(id) {
    try {
      const response = await api.delete(`/users/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting secretary:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao deletar a secretaria');
    }
  },

  /**
   * Get full user profile with relations populated
   */
  async obterPerfil(id) {
    try {
      const response = await api.get(`/users/${id}?populate=*`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error.response?.data?.error || new Error('Erro ao obter perfil do usuário');
    }
  },

  /**
   * Register a responsible user in Strapi
   */
  async criarResponsavel(username, email, password, escolaId) {
    try {
      const response = await api.post('/users', {
        username,
        email,
        password,
        escola: escolaId,
        cargo: 'responsavel',
        provider: 'local',
        confirmed: true,
        role: 1
      });
      return response.data;
    } catch (error) {
      console.error('Error creating responsible user:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao criar o responsável');
    }
  }
};
