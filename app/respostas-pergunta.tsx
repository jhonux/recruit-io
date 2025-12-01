import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { respostaService } from '../services/respostaService';

// Tipo atualizado para incluir a 'analise' se ela existir
type Resposta = {
  id: string;
  candidato: string;
  resposta: string;
  perguntaId: string;
  analise?: any; // <--- CAMPO NOVO (Pode vir null ou objeto)
};

export default function RespostasPerguntaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const perguntaId = params.id as string;
  const perguntaTexto = params.texto as string;

  const [respostas, setRespostas] = useState<Resposta[]>([]);
  const [loading, setLoading] = useState(true);

  // useFocusEffect para recarregar a lista se você analisou e voltou
  useFocusEffect(
    useCallback(() => {
      carregarRespostas();
    }, [])
  );

  const carregarRespostas = async () => {
    try {
      setLoading(true);
      const todas = await respostaService.listarRespostas();
      
      // Filtra as respostas desta pergunta
      const filtradas = todas.filter((r: Resposta) => r.perguntaId === perguntaId);
      setRespostas(filtradas);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const irParaAnalise = (resposta: Resposta) => {
    // LÓGICA INTELIGENTE:
    // Se já tem análise, passamos ela via string para a tela (evita novo POST).
    // Se não tem, passamos null e a tela lá vai fazer o POST.
    
    router.push({
      pathname: '/analise-ia',
      params: { 
        id: resposta.id, 
        candidato: resposta.candidato,
        textoResposta: resposta.resposta,
        contextoPergunta: perguntaTexto,
        // Envia o JSON da análise se existir (transformado em string)
        dadosExistentes: resposta.analise ? JSON.stringify(resposta.analise) : undefined
      }
    });
  };

  const renderItem = ({ item }: { item: Resposta }) => {
    // Verifica se já foi analisado (se o objeto analise existe)
    const jaAnalisado = !!item.analise;

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.candidato.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.candidatoName}>{item.candidato}</Text>
            {/* Mostra data ou status */}
            <Text style={styles.dateText}>
                {jaAnalisado ? 'Análise concluída' : 'Aguardando análise'}
            </Text>
          </View>
        </View>
        
        <Text style={styles.previewText} numberOfLines={2}>
          {item.resposta}
        </Text>

        {/* BOTÃO QUE MUDA DE COR E TEXTO */}
        <TouchableOpacity 
          style={[
            styles.analyzeButton, 
            jaAnalisado ? styles.buttonView : styles.buttonCreate
          ]} 
          onPress={() => irParaAnalise(item)}
        >
          <Ionicons 
            name={jaAnalisado ? "document-text-outline" : "sparkles"} 
            size={16} 
            color={jaAnalisado ? "#FFF" : "#1C1C1E"} 
          />
          <Text style={[
            styles.analyzeButtonText, 
            jaAnalisado ? { color: '#FFF' } : { color: '#1C1C1E' }
          ]}>
            {jaAnalisado ? "Ver Resultado" : "Analisar com IA"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
             <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Candidatos</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{perguntaTexto}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#34D399" />
        </View>
      ) : (
        <FlatList
          data={respostas}
          keyExtractor={(item, index) => item.id || String(index)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma resposta recebida ainda.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2C2C2E',
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  listContent: {
    padding: 24,
  },
  emptyText: {
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
    fontFamily: 'Poppins_400Regular',
  },
  card: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#1C1C1E',
    fontFamily: 'Poppins_700Bold',
    fontSize: 18,
  },
  candidatoName: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  dateText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
  },
  previewText: {
    color: '#CCC',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
    lineHeight: 20,
  },
  // Estilo Base do Botão
  analyzeButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  analyzeButtonText: {
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  // Estilo "Analisar" (Verde, chama atenção)
  buttonCreate: {
    backgroundColor: '#34D399',
  },
  // Estilo "Ver Resultado" (Azul ou Cinza, secundário)
  buttonView: {
    backgroundColor: '#3B82F6', // Azul
  },
});