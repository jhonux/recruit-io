import React, { useState, useCallback } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { perguntaService } from '../../services/perguntaService';
import { respostaService } from '../../services/respostaService';

type VagaDisponivel = {
  titulo: string;
  qtdPerguntas: number;
  status: 'novo' | 'em_andamento';
};

export default function CandidatoHomeScreen() {
  const router = useRouter();
  const [vagas, setVagas] = useState<VagaDisponivel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [nomeCandidato, setNomeCandidato] = useState('Candidato');

  const carregarDados = async () => {
    try {
      setLoading(true);
      const meuId = await AsyncStorage.getItem('user_id');
      const meuNome = await AsyncStorage.getItem('user_name');
      if (meuNome) setNomeCandidato(meuNome.split(' ')[0]);

      const [todasPerguntas, todasRespostas] = await Promise.all([
        perguntaService.listarTodas(),
        respostaService.listarRespostas()
      ]);

      const minhasRespostas = todasRespostas.filter((r: any) => r.usuarioId === meuId);

      const mapaTags = new Map<string, any[]>();
      
      todasPerguntas.forEach((p: any) => {
        const tag = (p.tags && p.tags.length > 0) ? p.tags[0] : 'Geral';
        const lista = mapaTags.get(tag) || [];
        lista.push(p);
        mapaTags.set(tag, lista);
      });

      const listaFinal: VagaDisponivel[] = [];

      mapaTags.forEach((perguntasDaTag, tag) => {
        // Verifica se o candidato respondeu pelo menos uma pergunta dessa tag
        const respondeuAlguma = perguntasDaTag.some(p => 
            minhasRespostas.find((r: any) => r.perguntaId === p.id)
        );

        listaFinal.push({
          titulo: tag,
          qtdPerguntas: perguntasDaTag.length,
          status: respondeuAlguma ? 'em_andamento' : 'novo'
        });
      });

      setVagas(listaFinal);

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

  const handleSair = () => {
    Alert.alert("Sair", "Deseja voltar para o menu inicial?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Sair", style: "destructive", onPress: async () => {
          await AsyncStorage.multiRemove(['user_id', 'user_name', 'user_email', 'user_type']);
          router.replace('/(auth)/login');
      }}
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
          <Text style={styles.greeting}>Olá, {nomeCandidato}!</Text>
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
        <Text style={styles.sectionTitle}>Processos Seletivos</Text>

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
                
                {vaga.status === 'em_andamento' && (
                    <View style={styles.statusBadge}>
                        <Ionicons name="time-outline" size={16} color="#FBBF24" />
                        <Text style={styles.statusText}>Em andamento</Text>
                    </View>
                )}
              </View>
              
              <View style={styles.divider} />

              <View style={styles.cardFooter}>
                <Text style={styles.questionCount}>
                    {vaga.qtdPerguntas} etapas
                </Text>
                
                <View style={[
                    styles.applyButton, 
                    vaga.status !== 'novo' && styles.applyButtonOutline
                ]}>
                    <Text style={[
                        styles.applyText,
                        vaga.status !== 'novo' && { color: '#34D399' }
                    ]}>
                        {vaga.status === 'novo' ? 'Participar' : 'Continuar'}
                    </Text>
                    <Ionicons 
                        name="arrow-forward" 
                        size={16} 
                        color={vaga.status === 'novo' ? '#1C1C1E' : '#34D399'} 
                    />
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
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 16 },
  greeting: { fontSize: 24, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  subGreeting: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888' },
  logoutButton: { padding: 8, backgroundColor: '#2C2C2E', borderRadius: 8 },
  content: { padding: 24, paddingTop: 0 },
  sectionTitle: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#34D399', marginBottom: 16 },
  emptyText: { color: '#666', textAlign: 'center', marginTop: 40, fontFamily: 'Poppins_400Regular' },
  card: { backgroundColor: '#2C2C2E', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#3A3A3C' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#34D399', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  cardTitle: { fontSize: 16, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  cardSubtitle: { fontSize: 14, fontFamily: 'Poppins_400Regular', color: '#888' },
  
  statusBadge: { flexDirection: 'row', alignItems: 'center', padding: 6, backgroundColor: 'rgba(251, 191, 36, 0.1)', borderRadius: 8, gap: 4 },
  statusText: { color: '#FBBF24', fontSize: 10, fontFamily: 'Poppins_700Bold' },

  divider: { height: 1, backgroundColor: '#3A3A3C', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  questionCount: { fontSize: 12, color: '#CCC', fontFamily: 'Poppins_400Regular' },
  applyButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#34D399', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, gap: 4 },
  applyButtonOutline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: '#34D399' },
  applyText: { color: '#1C1C1E', fontSize: 12, fontFamily: 'Poppins_700Bold' }
});