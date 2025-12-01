const API_URL = 'https://recruit-io-backend.vercel.app/api';

export const analiseService = {

  analisarResposta: async (respostaId: string, contexto: string) => {
    console.log("🤖 Solicitando análise para:", respostaId);

    try {
      const response = await fetch(`${API_URL}/analisar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          respostaId: respostaId,
          criterios: [
            "clareza",
            "aderencia_ao_tema",
            "praticidade",
            "preocupacao_com_seguranca"
          ],
          contextoPergunta: contexto
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro IA:', errorText);
        throw new Error('Falha na análise da IA');
      }

      const data = await response.json();
      console.log("✅ Análise concluída:", data);
      return data;

    } catch (error) {
      console.error('Erro no serviço de análise:', error);
      throw error;
    }
  }
};