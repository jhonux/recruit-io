import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { respostaService } from '../services/respostaService';

type CandidatoRankeado = {
  id: string; 
  candidatoNome: string;
  respostaTexto: string;
  score: number; 
  analiseCompleta?: any; 
  status: 'analisado' | 'pendente';
};

export default function CandidatosRanqueadosScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const perguntaId = params.perguntaId as string;
  const perguntaTexto = params.perguntaTexto as string;

  const [ranking, setRanking] = useState<CandidatoRankeado[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      calcularRanking();
    }, [])
  );

  const calcularRanking = async () => {
    try {
      setLoading(true);
      
      const todasRespostas = await respostaService.listarRespostas();
      const respostasDaPergunta = todasRespostas.filter((r: any) => r.perguntaId === perguntaId);

    
      const candidatosProcessados: CandidatoRankeado[] = await Promise.all(
        respostasDaPergunta.map(async (r: any) => {
          let score = 0;
          let analiseData = null;
          let status: 'analisado' | 'pendente' = 'pendente';

      
          const cache = await AsyncStorage.getItem(`analise_${r.id}`);
          
          if (cache) {
            const json = JSON.parse(cache);
       
            const dados = json.resultado || json; 
            score = dados.overall || dados.score || 0;
            analiseData = dados;
            status = 'analisado';
          } 
        
          else if (r.analise) {
             score = r.analise.score || 0;
             analiseData = r.analise;
             status = 'analisado';
          }

          return {
            id: r.id,
            candidatoNome: r.candidato,
            respostaTexto: r.resposta,
            score: score,
            analiseCompleta: analiseData,
            status: status
          };
        })
      );

      candidatosProcessados.sort((a, b) => b.score - a.score);

      setRanking(candidatosProcessados);

    } catch (error) {
      console.error("Erro ao calcular ranking", error);
    } finally {
      setLoading(false);
    }
  };

  const irParaAnalise = (item: CandidatoRankeado) => {
    const dadosParaEnvio = item.analiseCompleta;
    
    router.push({
      pathname: '/analise-ia',
      params: { 
        id: item.id, 
        candidato: item.candidatoNome,
        textoResposta: item.respostaTexto,
        contextoPergunta: perguntaTexto,
        dadosExistentes: dadosParaEnvio ? JSON.stringify(dadosParaEnvio) : undefined
      }
    });
  };

  const getMedalColor = (index: number) => {
    switch(index) {
      case 0: return '#FBBF24'; // Ouro
      case 1: return '#9CA3AF'; // Prata
      case 2: return '#B45309'; // Bronze
      default: return 'transparent';
    }
  };

  const renderItem = ({ item, index }: { item: CandidatoRankeado, index: number }) => (
    <TouchableOpacity style={styles.card} onPress={() => irParaAnalise(item)}>
      <View style={styles.rankColumn}>
        {item.status === 'analisado' ? (
           <View style={[styles.rankBadge, { borderColor: getMedalColor(index) }]}>
             <Text style={[styles.rankNumber, { color: index < 3 ? getMedalColor(index) : '#666' }]}>
               #{index + 1}
             </Text>
           </View>
        ) : (
           <Ionicons name="ellipse-outline" size={12} color="#666" />
        )}
      </View>

      <View style={styles.infoColumn}>
        <Text style={styles.name}>{item.candidatoNome}</Text>
        <Text style={styles.preview} numberOfLines={1}>{item.respostaTexto}</Text>
      </View>

      <View style={styles.scoreColumn}>
        {item.status === 'analisado' ? (
            <View style={styles.scoreBadge}>
                <Text style={styles.scoreText}>{item.score.toFixed(0)}</Text>
                <Text style={styles.scoreLabel}>pts</Text>
            </View>
        ) : (
            <View style={styles.pendingBadge}>
                <Text style={styles.pendingText}>Pendente</Text>
            </View>
        )}
      </View>
      
      <Ionicons name="chevron-forward" size={20} color="#444" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
             <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Ranking de Candidatos</Text>
            <Text style={styles.headerSubtitle} numberOfLines={1}>{perguntaTexto}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#34D399" />
        </View>
      ) : (
        <FlatList
          data={ranking}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma resposta para classificar.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#2C2C2E' },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#888' },
  listContent: { padding: 24 },
  emptyText: { color: '#666', marginTop: 20, textAlign: 'center', fontFamily: 'Poppins_400Regular' },
  
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
    borderRadius: 12, padding: 12, marginBottom: 12,
  },
  rankColumn: { width: 40, alignItems: 'center', justifyContent: 'center' },
  rankBadge: { 
    width: 32, height: 32, borderRadius: 16, borderWidth: 2, 
    justifyContent: 'center', alignItems: 'center' 
  },
  rankNumber: { fontFamily: 'Poppins_700Bold', fontSize: 12 },
  
  infoColumn: { flex: 1, paddingHorizontal: 12 },
  name: { color: '#FFF', fontFamily: 'Poppins_700Bold', fontSize: 14 },
  preview: { color: '#888', fontFamily: 'Poppins_400Regular', fontSize: 12 },

  scoreColumn: { marginRight: 12, alignItems: 'flex-end' },
  scoreBadge: { alignItems: 'center' },
  scoreText: { color: '#34D399', fontFamily: 'Poppins_700Bold', fontSize: 18 },
  scoreLabel: { color: '#34D399', fontSize: 10, fontFamily: 'Poppins_400Regular', marginTop: -4 },
  
  pendingBadge: { backgroundColor: '#3A3A3C', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4 },
  pendingText: { color: '#BBB', fontSize: 10, fontFamily: 'Poppins_700Bold' },
});