import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert 
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
  const modo = params.modo as string; 

  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [analisesPorPergunta, setAnalisesPorPergunta] = useState<Record<string, any>>({});
  const [respostasPorPergunta, setRespostasPorPergunta] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
    }, [])
  );

  const carregarDados = async () => {
    try {
      setLoading(true);
      
      const [todasPerguntas, todasRespostas] = await Promise.all([
        perguntaService.listarTodas(),
        respostaService.listarRespostas()
      ]);

      const perguntasDaVaga = todasPerguntas.filter((p: Pergunta) => 
        p.tags && p.tags.includes(tituloVaga)
      );
      setPerguntas(perguntasDaVaga);

      if (modo === 'candidato') {
        const meuId = await AsyncStorage.getItem('user_id');
        
        if (meuId) {
          const minhasRespostas = todasRespostas.filter((r: any) => r.usuarioId === meuId);
          
          const allKeys = await AsyncStorage.getAllKeys();
          const analiseKeys = allKeys.filter(k => k.startsWith('analise_'));
          const analisesRaw = await AsyncStorage.multiGet(analiseKeys);
          const mapaCache: Record<string, any> = {};
          analisesRaw.forEach(([key, value]) => {
             if (value) mapaCache[key.replace('analise_', '')] = JSON.parse(value);
          });

          const mapAnalises: Record<string, any> = {};
          const mapRespostas: Record<string, any> = {};
          
          minhasRespostas.forEach((r: any) => {
             mapRespostas[r.perguntaId] = r;

             const cache = mapaCache[r.id];
             const dados = cache?.resultado || cache || r.analise;
             
             if (dados) {
                mapAnalises[r.perguntaId] = dados;
             } else {
                mapAnalises[r.perguntaId] = { pending: true };
             }
          });

          setAnalisesPorPergunta(mapAnalises);
          setRespostasPorPergunta(mapRespostas);
        }
      }

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExcluir = async (id: string) => {
      if (modo === 'candidato') return;
      Alert.alert("Ação", "Deseja excluir?", [
          { text: "Cancelar" },
          { text: "Sim", onPress: async () => { await perguntaService.excluirPergunta(id); carregarDados(); } }
      ]);
  };

  const irParaResponder = (p: Pergunta) => {
    router.push({
      pathname: '/resposta',
      params: { id: p.id, texto: p.texto }
    });
  };

  const irParaVerRespostas = (p: Pergunta) => {
    router.push({
      pathname: '/respostas-pergunta',
      params: { id: p.id, texto: p.texto }
    } as any);
  };

  const irParaDetalhesAnalise = (p: Pergunta, analiseData: any, respostaData: any) => {
    router.push({
        pathname: '/analise-ia',
        params: {
            id: respostaData.id,
            candidato: respostaData.candidato, 
            textoResposta: respostaData.resposta,
            contextoPergunta: p.texto,
            dadosExistentes: JSON.stringify(analiseData) 
        }
    });
  };

  const getBarColor = (s: number) => {
    if (s >= 80) return '#34D399';
    if (s >= 50) return '#FBBF24';
    return '#EF4444';
  };

  const renderItem = ({ item, index }: { item: Pergunta, index: number }) => {
    const dadosAnalise = analisesPorPergunta[item.id];
    const dadosResposta = respostasPorPergunta[item.id];
    
    const jaRespondeu = !!dadosAnalise;
    const temNota = jaRespondeu && !dadosAnalise.pending;
    
    const score = temNota ? (dadosAnalise.overall || dadosAnalise.score || 0) : 0;

    return (
      <TouchableOpacity 
        style={styles.card}
        activeOpacity={0.9}
        onLongPress={() => modo !== 'candidato' && handleExcluir(item.id)}
      >
        <View style={styles.cardHeader}>
          <Text style={styles.questionIndex}>PERGUNTA {index + 1}</Text>
          
          {jaRespondeu && modo === 'candidato' && (
            <View style={styles.doneBadge}>
              <Text style={styles.doneText}>Enviada</Text>
              <Ionicons name="checkmark" size={12} color="#FFF" />
            </View>
          )}
        </View>
        
        <Text style={styles.questionText}>{item.texto}</Text>
        
        {modo === 'candidato' ? (
          jaRespondeu ? (
            temNota ? (
               <TouchableOpacity 
                 style={styles.scoreContainer}
                 onPress={() => irParaDetalhesAnalise(item, dadosAnalise, dadosResposta)}
               >
                  <View style={styles.scoreHeader}>
                    <Text style={styles.aderenciaLabel}>Sua Aderência</Text>
                    <View style={styles.clickHint}>
                        <Text style={styles.clickHintText}>Ver análise</Text>
                        <Ionicons name="chevron-forward" size={12} color="#888" />
                    </View>
                  </View>
                  
                  <View style={styles.barContainer}>
                      <View style={styles.barTrack}>
                          <View style={[styles.barFill, { width: `${score}%`, backgroundColor: getBarColor(score) }]} />
                      </View>
                      <Text style={[styles.scoreValue, { color: getBarColor(score) }]}>{score}%</Text>
                  </View>
               </TouchableOpacity>
            ) : (
               <View style={styles.pendingBox}>
                   <Ionicons name="time-outline" size={16} color="#888" />
                   <Text style={styles.pendingText}>Análise da IA em andamento...</Text>
               </View>
            )
          ) : (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={() => irParaResponder(item)}
            >
              <Text style={styles.actionButtonText}>Responder Agora</Text>
              <Ionicons name="pencil" size={16} color="#1C1C1E" />
            </TouchableOpacity>
          )
        ) : (
          <TouchableOpacity 
            style={[styles.actionButton, styles.recruiterButton]} 
            onPress={() => irParaVerRespostas(item)}
          >
            <Text style={[styles.actionButtonText, { color: '#34D399' }]}>Ver Respostas</Text>
            <Ionicons name="people" size={16} color="#34D399" />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
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
                {modo === 'candidato' ? 'Acompanhe seu desempenho' : 'Gerencie as perguntas'}
            </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#34D399" /></View>
      ) : (
        <FlatList
          data={perguntas}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma pergunta encontrada.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  headerSubtitle: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#888' },
  listContent: { padding: 24, paddingTop: 0 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 50 },
  card: { backgroundColor: '#2C2C2E', borderRadius: 12, padding: 16, marginBottom: 16 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  questionIndex: { color: '#34D399', fontSize: 12, fontFamily: 'Poppins_700Bold', letterSpacing: 1 },
  questionText: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_400Regular', marginBottom: 16, lineHeight: 24 },
  actionButton: { backgroundColor: '#34D399', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 12, borderRadius: 8, gap: 8 },
  actionButtonText: { color: '#1C1C1E', fontFamily: 'Poppins_700Bold', fontSize: 14 },
  disabledButton: { backgroundColor: '#3A3A3C' },
  disabledText: { color: '#888', fontFamily: 'Poppins_700Bold', fontSize: 14 },
  recruiterButton: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#34D399' },
  doneBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#34D399', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, gap: 4 },
  doneText: { color: '#FFF', fontSize: 10, fontFamily: 'Poppins_700Bold' },
  scoreContainer: { marginTop: 4, padding: 8, backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 8 },
  scoreHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  clickHint: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  clickHintText: { color: '#888', fontSize: 10, fontFamily: 'Poppins_400Regular' },
  aderenciaLabel: { color: '#CCC', fontSize: 12, fontFamily: 'Poppins_700Bold' },
  barContainer: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  barTrack: { flex: 1, height: 8, backgroundColor: '#444', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  scoreValue: { fontSize: 14, fontFamily: 'Poppins_700Bold', minWidth: 35, textAlign: 'right' },
  pendingBox: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 8 },
  pendingText: { color: '#888', fontSize: 12, fontFamily: 'Poppins_400Regular' }
});