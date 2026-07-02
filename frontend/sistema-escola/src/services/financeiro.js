import api from './api';

export const financeiroService = {

    async pagarParcela(documentId) {
        try {
            await api.put(`/parcelas/${documentId}`, {
                data: {
                    StatusPagamento: 'Pago'
                }
            });
        } catch (error) {
            console.error('Erro ao pagar parcela:', error);
            throw error;
        }
    },

    async desmarcarPagamento(documentId) {
        try {
            await api.put(`/parcelas/${documentId}`, {
                data: {
                    StatusPagamento: 'Pendente'
                }
            });
        } catch (error) {
            console.error('Erro ao desmarcar pagamento:', error);
            throw error;
        }
    }
};
