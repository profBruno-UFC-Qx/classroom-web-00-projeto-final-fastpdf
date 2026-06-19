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
        localStorage.setItem('user', JSON.stringify(user));
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
  }
};
