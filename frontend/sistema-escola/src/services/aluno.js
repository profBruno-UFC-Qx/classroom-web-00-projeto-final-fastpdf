import api from './api';

export const alunoService = {
  /**
   * Fetch all students from Strapi
   * @returns {Promise<Array>} List of students
   */
  async obterAlunos() {
    try {
      const response = await api.get('/alunos?populate=*');
      // Strapi returns an array of objects inside response.data.data
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao obter alunos:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao obter os alunos');
    }
  },

  /**
   * Register a new student in Strapi
   * @param {object} dadosAluno - Student data matching backend capitalization
   * @returns {Promise<object>} The registered student data
   */
  async cadastrarAluno(dadosAluno) {
    try {
      // Strapi v4/v5 expects POST payload wrapped in a "data" object
      const response = await api.post('/alunos', {
        data: dadosAluno
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao cadastrar aluno:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao cadastrar o aluno');
    }
  },

  /**
   * Update student details in Strapi
   * @param {number|string} id - Student ID
   * @param {object} dadosAluno - Student data
   * @returns {Promise<object>} The updated data
   */
  async atualizarAluno(id, dadosAluno) {
    try {
      const response = await api.put(`/alunos/${id}`, {
        data: dadosAluno
      });
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar aluno:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao atualizar o aluno');
    }
  },

  /**
   * Delete student from Strapi
   * @param {number|string} id - Student ID
   * @returns {Promise<object>} Response confirmation
   */
  async deletarAluno(id) {
    try {
      const response = await api.delete(`/alunos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar aluno:', error);
      throw error.response?.data?.error || new Error('Ocorreu um erro ao deletar o aluno');
    }
  }
};
