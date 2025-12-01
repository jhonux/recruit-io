import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { perguntaService } from '../../services/perguntaService';

type VagaDisponivel = {
  titulo: string;
  qtdPerguntas: number;
};

export default function CandidatoHomeScreen() {
  const router = useRouter();
  const [vagas, setVagas] = useState<VagaDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const carregarVagas = async () => {
    try {
      setLoading(true);
      const perguntas = await perguntaService.listarTodas();

      const agrupamento: Record<string, number> = {};
      perguntas.forEach((p: any) => {
        const titulo = (p.tags && p.tags.length > 0) ? p.tags[0] : 'Geral';
        if (!agrupamento[titulo]) agrupamento[titulo] = 0;
        agrupamento[titulo] += 1;
      });

      const lista = Object.keys(agrupamento).map(titulo => ({
        titulo,
        qtdPerguntas: agrupamento[titulo]
      }));

      setVagas(lista.reverse());
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => { carregarVagas(); }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarVagas();
  };

  const handleSair = () => {
    Alert.alert("Sair", "Deseja voltar para o menu inicial?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: () => router.replace('/(auth)/login') }
    ]);
  };

  const irParaVaga = (titulo: string) => {
    router.push({
      pathname: '/detalhes-pergunta',
      params: { 
        titulo: titulo,
        modo: 'candidato'
    }
    } as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Olá, Candidato!</Text>
          <Text style={styles.subGreeting}>Encontre sua próxima oportunidade</Text>
        </View>
        <TouchableOpacity onPress={handleSair} style={styles.logoutButton}>
           <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#34D399" />}
      >
        <Text style={styles.sectionTitle}>Processos Seletivos Abertos</Text>

        {loading && !refreshing ? (
          <ActivityIndicator color="#34D399" style={{ marginTop: 20 }} />
        ) : vagas.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma vaga aberta no momento.</Text>
        ) : (
          vagas.map((vaga, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.card}
              onPress={() => irParaVaga(vaga.titulo)}
              activeOpacity={0.7}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                    <Feather name="code" size={24} color="#1C1C1E" />
                </View>
                <View style={{flex: 1}}>
                    <Text style={styles.cardTitle}>{vaga.titulo}</Text>
                    <Text style={styles.cardSubtitle}>Recruit.io Inc.</Text>
                </View>
              </View>
              
              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <Text style={styles.questionCount}>
                    {vaga.qtdPerguntas} etapas (perguntas)
                </Text>
                <View style={styles.applyButton}>
                    <Text style={styles.applyText}>Participar</Text>
                    <Ionicons name="arrow-forward" size={16} color="#FFF" />
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
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
  logoutButton: {
    padding: 8,
    backgroundColor: '#2C2C2E',
    borderRadius: 8,
  },
  content: {
    padding: 24,
    paddingTop: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
    color: '#34D399',
    marginBottom: 16,
  },
  emptyText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 40,
    fontFamily: 'Poppins_400Regular',
  },
  
  card: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  cardSubtitle: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  divider: {
    height: 1,
    backgroundColor: '#3A3A3C',
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionCount: {
    fontSize: 12,
    color: '#CCC',
    fontFamily: 'Poppins_400Regular',
  },
  applyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34D399', 
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  applyText: {
    color: '#1C1C1E',
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
  }
});