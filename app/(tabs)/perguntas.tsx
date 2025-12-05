import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { perguntaService } from '../../services/perguntaService'; 

type VagaAgrupada = {
  titulo: string;
  qtdPerguntas: number;
  tags: string[];
};

export default function ListaVagasScreen() {
  const router = useRouter();
  
  const [vagas, setVagas] = useState<VagaAgrupada[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarVagas = async () => {
    try {
      setLoading(true);
      const perguntas = await perguntaService.listarTodas();


      const agrupamento: Record<string, number> = {};

      perguntas.forEach((p: any) => {
        const tituloVaga = (p.tags && p.tags.length > 0) ? p.tags[0] : 'Sem Título';
        
        if (!agrupamento[tituloVaga]) {
          agrupamento[tituloVaga] = 0;
        }
        agrupamento[tituloVaga] += 1; 
      });

      const listaVagas: VagaAgrupada[] = Object.keys(agrupamento).map(titulo => ({
        titulo,
        qtdPerguntas: agrupamento[titulo],
        tags: [titulo]
      }));

      setVagas(listaVagas);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      carregarVagas();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarVagas();
  };

  const renderItem = ({ item }: { item: VagaAgrupada }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push({
        pathname: '/detalhes-pergunta',
        params: { titulo: item.titulo }
      })}
    >
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.titulo}</Text>
        <View style={styles.statusBadge}>
            <Text style={styles.statusText}>Ativa</Text>
        </View>
      </View>
      
      <View style={styles.cardFooter}>
        <View style={styles.infoRow}>
            <Feather name="list" size={16} color="#888" />
            <Text style={styles.infoText}>
              {item.qtdPerguntas} {item.qtdPerguntas === 1 ? 'pergunta' : 'perguntas'}
            </Text>
        </View>
        
        <View style={styles.arrowButton}>
            <Ionicons name="chevron-forward" size={20} color="#34D399" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Minhas Perguntas</Text>
        <Text style={styles.headerSubtitle}>Gerencie suas perguntas aqui!</Text>
      </View>

      {loading && !refreshing ? (
        <View style={styles.center}>
            <ActivityIndicator size="large" color="#34D399" />
        </View>
      ) : (
        <FlatList
          data={vagas}
          keyExtractor={(item) => item.titulo} 
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34D399" />
          }
          ListEmptyComponent={
              <Text style={styles.emptyText}>Nenhuma vaga encontrada. Crie a primeira!</Text>
          }
        />
      )}

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/criar-pergunta')}
      >
        <Ionicons name="add" size={32} color="#1C1C1E" />
      </TouchableOpacity>

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
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  listContent: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 100,
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
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    backgroundColor: 'rgba(52, 211, 153, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    color: '#34D399',
    fontSize: 10,
    fontFamily: 'Poppins_700Bold',
    textTransform: 'uppercase',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoText: {
    color: '#888',
    fontFamily: 'Poppins_400Regular',
    fontSize: 14,
  },
  arrowButton: {
    padding: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});