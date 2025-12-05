import React, { useState, useEffect } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { perguntaService } from '../services/perguntaService';
import { respostaService } from '../services/respostaService';

type CandidatoRankeado = {
  id: string;
  nome: string;
  score: number;
  resposta: string;
  analiseData: any;
  perguntaTexto: string;
};

export default function RankingTagScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const tagSelecionada = params.tag as string;

  const [ranking, setRanking] = useState<CandidatoRankeado[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    calcularRanking();
  }, []);

  const calcularRanking = async () => {
    try {
      setLoading(true);
      const meuId = await AsyncStorage.getItem('user_id');

      const [todasPerguntas, todasRespostas] = await Promise.all([
        perguntaService.listarTodas(),
        respostaService.listarRespostas()
      ]);

      const perguntasDaTag = todasPerguntas.filter((p: any) => 
        p.usuarioId === meuId && p.tags && p.tags.includes(tagSelecionada)
      );
      
      const mapPerguntas: Record<string, string> = {};
      perguntasDaTag.forEach((p: any) => mapPerguntas[p.id] = p.texto);

      const respostasDaTag = todasRespostas.filter((r: any) => mapPerguntas[r.perguntaId]);

      const keys = await AsyncStorage.getAllKeys();
      const analiseKeys = keys.filter(k => k.startsWith('analise_'));
      const analisesRaw = await AsyncStorage.multiGet(analiseKeys);
      const mapaCache: Record<string, any> = {};
      analisesRaw.forEach(([key, value]) => {
        if (value) mapaCache[key.replace('analise_', '')] = JSON.parse(value);
      });

      const candidatosProcessados = await Promise.all(respostasDaTag.map(async (r: any) => {
        let score = 0;
        let analiseData = null;

        const cache = mapaCache[r.id];
        const dados = cache?.resultado || cache || r.analise;

        if (dados) {
            score = dados.overall || dados.score || 0;
            analiseData = dados;
        }

        return {
            id: r.id,
            nome: r.candidato,
            resposta: r.resposta,
            score: Math.round(score),
            analiseData: analiseData,
            perguntaTexto: mapPerguntas[r.perguntaId]
        };
      }));

      candidatosProcessados.sort((a: any, b: any) => b.score - a.score);

      setRanking(candidatosProcessados);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const irParaAnalise = (item: CandidatoRankeado) => {
    const dados = item.analiseData;
    router.push({
        pathname: '/analise-ia',
        params: { 
          id: item.id, 
          candidato: item.nome,
          textoResposta: item.resposta,
          contextoPergunta: item.perguntaTexto,
          dadosExistentes: dados ? JSON.stringify(dados) : undefined
        }
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#34D399';
    if (score >= 50) return '#FBBF24';
    return '#EF4444';
  };

  const renderItem = ({ item, index }: { item: CandidatoRankeado, index: number }) => (
    <TouchableOpacity style={styles.card} onPress={() => irParaAnalise(item)}>
      
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{item.nome.charAt(0).toUpperCase()}</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.nome}</Text>
        
        <View style={styles.scoreRow}>
            <Text style={styles.aderenciaLabel}>Aderência</Text>
            
            <View style={styles.barTrack}>
                <View 
                    style={[
                        styles.barFill, 
                        { width: `${item.score}%`, backgroundColor: getScoreColor(item.score) }
                    ]} 
                />
            </View>
            
            <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
                {item.score}%
            </Text>
        </View>
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
        <View>
            <Text style={styles.headerTitle}>{tagSelecionada}</Text>
            <Text style={styles.headerSubtitle}>Ordenado por maior pontuação</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#34D399" /></View>
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
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#888' },
  listContent: { padding: 24 },
  emptyText: { color: '#666', marginTop: 20, textAlign: 'center', fontFamily: 'Poppins_400Regular' },
  
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
    borderRadius: 16, padding: 16, marginBottom: 12, gap: 12
  },
  
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: '#34D399',
    justifyContent: 'center', alignItems: 'center', marginRight: 4
  },
  avatarText: { color: '#1C1C1E', fontFamily: 'Poppins_700Bold', fontSize: 18 },

  name: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF', marginBottom: 6 },
  
  scoreRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  aderenciaLabel: { color: '#888', fontSize: 12, fontFamily: 'Poppins_400Regular' },
  barTrack: { flex: 1, height: 6, backgroundColor: '#444', borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  scoreText: { fontSize: 12, fontFamily: 'Poppins_700Bold', width: 35, textAlign: 'right' },
});