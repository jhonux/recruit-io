import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://recruit-io-backend.vercel.app/api';

export const perguntaService = {

    criarPergunta: async (texto: string, tag: string) => {
        const recrutadorId = await AsyncStorage.getItem('user_id');

        if (!recrutadorId) {
            throw new Error('Recrutador não autenticado');
        }

        try {
            const response = await fetch(`${API_URL}/perguntas`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    texto: texto,
                    tags: [tag],
                    usuarioId: recrutadorId
                }),
            });

            if (!response.ok) {
                throw new Error('Erro ao criar pergunta');
            }

            return await response.json();
        } catch (error) {
            console.error('Error ao criar pergunta:', error);
            throw error;
        }
    },

    criarVariasPerguntas: async (listaPerguntas: string[], tituloVaga: string) => {
        const promises = listaPerguntas.map(pergunta =>
            perguntaService.criarPergunta(pergunta, tituloVaga)
        );
        return Promise.all(promises);
    },

    listarTodas: async () => {
        try {
            const response = await fetch(`${API_URL}/perguntas`);

            if (!response.ok) {
                throw new Error('Erro ao buscar perguntas');
            }

            const dados = await response.json();
            return dados; 
        } catch (error) {
            console.error('Erro ao listar perguntas:', error);
            throw error;
        }
    },
    excluirPergunta: async (id: string) => {
        console.log("Excluindo pergunta com ID:", id);
        try {
            const response = await fetch(`${API_URL}/perguntas/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || "Erro ao excluir pergunta");
            }
            
            return true;
        } catch (error) {
            console.error('Erro ao excluir pergunta:', error);
            throw error;
        }
    }

};