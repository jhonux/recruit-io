import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://recruit-io-backend.vercel.app/api';

export const respostaService = {

  enviarResposta: async (perguntaId: string, resposta: string) => {
    
   
    const usuarioId = await AsyncStorage.getItem('user_id');
    const nomeCandidato = await AsyncStorage.getItem('user_name');

    if (!usuarioId) {
      console.error("Erro: Usuário não logado no Storage.");
      throw new Error('Usuário não autenticado.');
    }

    const payload = {
      candidato: nomeCandidato || 'Candidato Anônimo',
      perguntaId: perguntaId,
      resposta: resposta,
      usuarioId: usuarioId 
    };

    console.log("📤 Payload Final enviando para API:", payload);

    try {
      const response = await fetch(`${API_URL}/respostas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro Back-end:', errorText);
        throw new Error(`O servidor rejeitou: ${errorText}`);
      }

      const data = await response.json();
      console.log("Sucesso:", data);
      return data;

    } catch (error) {
      console.error('Erro no fetch:', error);
      throw error;
    }
  },

  listarRespostas: async () => {
    try {
      const response = await fetch(`${API_URL}/respostas`);
      if (!response.ok) throw new Error('Erro ao buscar respostas');
      return await response.json();
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
};