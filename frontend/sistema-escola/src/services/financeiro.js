import api from './api';

export const financeiroService = {

  async pagarParcela(id) {
    try {
      await api.put(`/parcelas/${id}`, {
        data: {
          StatusPagamento: 'Pago'
        }
      });
    } catch (error) {
      console.error('Erro ao pagar parcela:', error);
      throw error;
    }
  }
};
