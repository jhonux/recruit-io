import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { useState, useCallback } from 'react';

import { perguntaService } from '../../services/perguntaService';

type VagaResumo = {
  titulo: string;
  qtdPerguntas: number;
}

export default function HomeScreen() {
  const router = useRouter();

  const [vagasRecentes, setVagasRecentes] = useState<VagaResumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  const carregarDashboard = async () => {
    try {
      setLoading(true);
      const perguntas = await perguntaService.listarTodas();

      const agrupamento: Record<string, number> = {};

      perguntas.forEach((p: any) => {
        const tituloVaga = (p.tags && p.tags.length > 0) ? p.tags[0] : 'Geral';
        if (!agrupamento[tituloVaga]) {
          agrupamento[tituloVaga] = 0;
        }
        agrupamento[tituloVaga] += 1;
      });

      const lista: VagaResumo[] = Object.keys(agrupamento).map(titulo => ({
        titulo,
        qtdPerguntas: agrupamento[titulo]
      }));

      setVagasRecentes(lista.reverse());

    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  useFocusEffect(
    useCallback(() => {
      carregarDashboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDashboard();
  };

  const irParaDetalhes = (titulo: string) => {
    router.push({
      pathname: '/detalhes-pergunta', 
      params: { titulo: titulo }
    } as any); 
  };

    return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34D399" />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Olá, Recrutador!</Text>
            <Text style={styles.subGreeting}>Bem-vindo de volta</Text>
          </View>
          <View style={styles.profileImagePlaceholder}>
             <Feather name="user" size={24} color="#FFF" />
          </View>
        </View>

       
        <Text style={styles.sectionTitle}>Seu Resumo</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Perguntas Criadas</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#34D399" />
            ) : (
              <Text style={styles.statValue}>{vagasRecentes.length}</Text>
            )}
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Respostas Recebidas</Text>
            <Text style={styles.statValue}>0</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Perguntas recentes</Text>
        
        {loading && !refreshing ? (
          <ActivityIndicator color="#34D399" style={{ marginTop: 20 }} />
        ) : vagasRecentes.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma vaga criada ainda.</Text>
        ) : (
          vagasRecentes.map((vaga, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.jobCard}
              onPress={() => irParaDetalhes(vaga.titulo)}
              activeOpacity={0.7}
            >
              <View style={styles.jobHeader}>
                <Text style={styles.jobTitle}>{vaga.titulo}</Text>
              </View>
              
              <View style={styles.jobInfo}>
                <Feather name="list" size={16} color="#888" />
                <Text style={styles.jobInfoText}>
                  {vaga.qtdPerguntas} {vaga.qtdPerguntas === 1 ? 'pergunta' : 'perguntas'} cadastradas
                </Text>
              </View>

              <View style={styles.verCandidatosButton}>
                 <Text style={styles.verCandidatosText}>Ver detalhes</Text>
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => router.push('/criar-pergunta')}
      >
        <Feather name="plus" size={32} color="#1C1C1E" />
      </TouchableOpacity>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 100,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  subGreeting: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  profileImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2C2C2E',
    justifyContent: 'center',
    alignItems: 'center',
  },


  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#2C2C2E',
    padding: 16,
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins_400Regular',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 32,
    color: '#FFF',
    fontFamily: 'Poppins_700Bold',
  },

  jobCard: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
  },
  jobHeader: {
    marginBottom: 8,
  },
  jobTitle: {
    fontSize: 16,
    color: '#FFF',
    fontFamily: 'Poppins_700Bold',
  },
  jobInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  jobInfoText: {
    color: '#888',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
  },
  verCandidatosButton: {
    backgroundColor: '#34D399',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  verCandidatosText: {
    color: '#1C1C1E',
    fontFamily: 'Poppins_700Bold',
    fontSize: 14,
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
});
