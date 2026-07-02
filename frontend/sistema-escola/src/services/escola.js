import api from './api';

export const escolaService = {
 
  async cadastrar(dadosEscola) {
    try {
      // Strapi v4/v5 expects POST data to be wrapped in a "data" object
      const response = await api.post('/escolas', {
        data: dadosEscola
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar escola:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao cadastrar a escola');
    }
  },


  async atualizar(id, dadosEscola) {
    try {
      const response = await api.put(`/escolas/${id}`, {
        data: dadosEscola
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar escola:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao atualizar a escola');
    }
  }
};
