import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { perguntaService } from '../../services/perguntaService';
import { respostaService } from '../../services/respostaService';

type TagResumo = {
  titulo: string;
  qtdCandidatos: number;
};

export default function ResultadosScreen() {
  const router = useRouter();
  const [tags, setTags] = useState<TagResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const meuId = await AsyncStorage.getItem('user_id');

      const [todasPerguntas, todasRespostas] = await Promise.all([
        perguntaService.listarTodas(),
        respostaService.listarRespostas()
      ]);

      const minhasPerguntas = todasPerguntas.filter((p: any) => p.usuarioId === meuId);

      const perguntaParaTag: Record<string, string> = {};
      minhasPerguntas.forEach((p: any) => {
        const tag = (p.tags && p.tags.length > 0) ? p.tags[0] : 'Geral';
        perguntaParaTag[p.id] = tag;
      });

      const contagemTags: Record<string, number> = {};
      
      Object.values(perguntaParaTag).forEach(tag => contagemTags[tag] = 0);

      todasRespostas.forEach((r: any) => {
        const tagDaResposta = perguntaParaTag[r.perguntaId];
        if (tagDaResposta) {
          contagemTags[tagDaResposta] += 1;
        }
      });

      const listaTags = Object.keys(contagemTags).map(tag => ({
        titulo: tag,
        qtdCandidatos: contagemTags[tag]
      }));

      setTags(listaTags);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => { carregarDados(); }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  const irParaRanking = (tag: string) => {
    router.push({
      pathname: '/ranking-tag',
      params: { tag: tag }
    } as any);
  };

  const renderItem = ({ item }: { item: TagResumo }) => (
    <TouchableOpacity style={styles.card} onPress={() => irParaRanking(item.titulo)}>
      <View style={styles.iconContainer}>
        <Feather name="target" size={24} color="#34D399" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.tagTitle}>{item.titulo}</Text>
        <Text style={styles.tagSub}>{item.qtdCandidatos} respostas para analisar</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Resultados</Text>
        <Text style={styles.headerSubtitle}>Selecione uma tag para ver os resultados</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}><ActivityIndicator size="large" color="#34D399" /></View>
      ) : (
        <FlatList
          data={tags}
          keyExtractor={(item) => item.titulo}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34D399" />}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Nenhuma vaga encontrada.</Text>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { padding: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  headerSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888' },
  listContent: { padding: 24, paddingTop: 0 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40 },
  
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#2C2C2E',
    borderRadius: 16, padding: 16, marginBottom: 12, gap: 16
  },
  iconContainer: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(52, 211, 153, 0.1)',
    justifyContent: 'center', alignItems: 'center'
  },
  tagTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  tagSub: { fontSize: 12, fontFamily: 'Poppins_400Regular', color: '#AAA' },
});