import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { perguntaService } from '../services/perguntaService';
import { respostaService } from '../services/respostaService';

type Pergunta = {
  id: string;
  texto: string;
  tags: string[];
};

export default function DetalhesVagaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const tituloVaga = params.titulo as string;
  const modo = params.modo as string; // 'candidato' ou undefined (recrutador)

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [idsRespondidos, setIdsRespondidos] = useState<string[]>([]); // Lista de IDs já respondidos
  const [loading, setLoading] = useState(true);

  // useFocusEffect garante que a lista atualize se ele responder e voltar pra cá
  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      // 1. Busca Perguntas e Respostas em paralelo
      const [todasPerguntas, todasRespostas] = await Promise.all([
        perguntaService.listarTodas(),
        respostaService.listarRespostas()
      ]);

      // 2. Filtra perguntas da vaga atual
      const perguntasDaVaga = todasPerguntas.filter((p: Pergunta) => 
        p.tags && p.tags.includes(tituloVaga)
      );
      setPerguntas(perguntasDaVaga);

      // 3. Se for candidato, descobre quais ele já respondeu
      if (modo === 'candidato') {
        const meuId = await AsyncStorage.getItem('user_id');
        
        if (meuId) {
          // Filtra respostas que tem o meu usuarioId
          const minhasRespostas = todasRespostas.filter((r: any) => r.usuarioId === meuId);
          // Cria um array só com os IDs das perguntas
          const ids = minhasRespostas.map((r: any) => r.perguntaId);
          setIdsRespondidos(ids);
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const irParaResponder = (pergunta: Pergunta) => {
    router.push({
      pathname: '/responder',
      params: { id: pergunta.id, texto: pergunta.texto }
    });
  };

  const irParaVerRespostas = (pergunta: Pergunta) => {
    router.push({
      pathname: '/respostas-pergunta',
      params: { 
        id: pergunta.id, 
        texto: pergunta.texto 
      }
    } as any);
  };

  const renderItem = ({ item, index }: { item: Pergunta, index: number }) => {
    // Verifica se esta pergunta específica já foi respondida
    const jaRespondeu = idsRespondidos.includes(item.id);

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.questionIndex}>PERGUNTA {index + 1}</Text>
          {/* Badge Visual de Concluído */}
          {jaRespondeu && modo === 'candidato' && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>Concluída</Text>
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          )}
        </View>
        
        <Text style={styles.questionText}>{item.texto}</Text>
        
        {/* --- LÓGICA DO BOTÃO --- */}
        {modo === 'candidato' ? (
          // MODO CANDIDATO
          jaRespondeu ? (
            // Botão Bloqueado (Já respondeu)
            <TouchableOpacity 
              style={[styles.actionButton, styles.disabledButton]} 
              disabled={true}
            >
              <Text style={styles.disabledText}>Resposta Enviada</Text>
              <Ionicons name="checkmark-circle" size={16} color="#888" />
            </TouchableOpacity>
          ) : (
            // Botão Ativo (Pode responder)
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => irParaResponder(item)}
            >
              <Text style={styles.actionButtonText}>Responder Agora</Text>
              <Ionicons name="pencil" size={16} color="#1C1C1E" />
            </TouchableOpacity>
          )
        ) : (
          // MODO RECRUTADOR
          <TouchableOpacity 
            style={[styles.actionButton, styles.recruiterButton]} 
            onPress={() => irParaVerRespostas(item)}
          >
            <Text style={[styles.actionButtonText, { color: '#34D399' }]}>Ver Respostas</Text>
            <Ionicons name="people" size={16} color="#34D399" />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
             <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{flex: 1}}>
            <Text style={styles.headerTitle}>{tituloVaga}</Text>
            <Text style={styles.headerSubtitle}>
                {modo === 'candidato' ? 'Complete as etapas abaixo' : 'Gerencie as perguntas'}
            </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#34D399" />
        </View>
      ) : (
        <FlatList
          data={perguntas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma pergunta encontrada.</Text>
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
  },
  headerTitle: {
    fontSize: 18,
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
    paddingTop: 0,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 50,
    fontFamily: 'Poppins_400Regular',
  },
  card: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  questionIndex: {
    color: '#34D399',
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    letterSpacing: 1,
  },
  questionText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
    lineHeight: 24,
  },
  
  // Botões
  actionButton: {
    backgroundColor: '#34D399',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonText: {
    color: '#1C1C1E',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  // Estilo Botão Bloqueado
  disabledButton: {
    backgroundColor: '#3A3A3C', // Cinza escuro
  },
  disabledText: {
    color: '#888',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
  },
  // Estilo Botão Recrutador
  recruiterButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  // Badge de Concluído no topo
  doneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34D399',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  doneText: {
    color: '#FFF',
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
  }
});