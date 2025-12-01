import React, { useEffect, useState } from 'react';
import { 
  View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { analiseService } from '../services/analiseService';

export default function AnaliseIAScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const { id, candidato, textoResposta, contextoPergunta, dadosExistentes } = params;
  
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState<any>(null);

  useEffect(() => {
    verificarDados();
  }, []);

  const verificarDados = async () => {
    // 1. VERIFICAÇÃO INTELIGENTE
    if (dadosExistentes) {
      // Se já recebemos os dados prontos da tela anterior, usamos eles!
      try {
        const json = JSON.parse(dadosExistentes as string);
        setDados({ resultado: json }); // Ajusta estrutura se necessário
        setLoading(false);
        return; // Para por aqui, não chama API
      } catch (e) {
        console.error("Erro ao ler dados existentes", e);
      }
    }

    // 2. Se não veio pronto, chama a API (POST)
    processarAnalise();
  };

  const processarAnalise = async () => {
    try {
      const resultadoApi = await analiseService.analisarResposta(
        id as string, 
        contextoPergunta as string
      );
      setDados(resultadoApi);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível carregar a análise.');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return '#34D399';
    if (score >= 50) return '#FBBF24';
    return '#EF4444';
  };

  // Se 'dadosExistentes' foi usado, a estrutura pode ser direta ou aninhada em 'resultado'
  // O backend retorna { resultado: { ... } }, mas se o campo no banco já for o objeto, ajustamos:
  const resultado = dados?.resultado || dados; 
  
  const scoreGeral = resultado?.overall || 0;
  const notasDetalhadas = resultado?.scores || {};
  const observacoes = resultado?.notes || [];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
             <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relatório do Gemini</Text>
        </View>

        {/* ... (RESTANTE DO JSX IGUAL AO ANTERIOR) ... */}
        {/* Vou resumir para economizar espaço, mas MANTENHA O MESMO JSX DE ANTES */}
        
        <View style={styles.candidatoCard}>
            <View style={styles.avatar}>
                <Text style={styles.avatarText}>{(candidato as string)?.[0]?.toUpperCase()}</Text>
            </View>
            <View>
                <Text style={styles.candidatoLabel}>Candidato</Text>
                <Text style={styles.candidatoName}>{candidato}</Text>
            </View>
        </View>

        <View style={styles.originalBox}>
            <Text style={styles.boxLabel}>RESPOSTA DO CANDIDATO:</Text>
            <Text style={styles.originalText}>"{textoResposta}"</Text>
        </View>

        {loading ? (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#34D399" />
                <Text style={styles.loadingText}>Processando com Gemini...</Text>
                <Text style={styles.loadingSubText}>Analisando critérios técnicos.</Text>
            </View>
        ) : resultado ? ( // Verifica se 'resultado' existe
            <View style={styles.resultContainer}>
                
                <View style={styles.scoreSection}>
                    <View style={[styles.scoreCircle, { borderColor: getScoreColor(scoreGeral) }]}>
                        <Text style={[styles.scoreValue, { color: getScoreColor(scoreGeral) }]}>
                            {scoreGeral ? scoreGeral.toFixed(0) : 0}
                        </Text>
                        <Text style={styles.scoreLabel}>Score Geral</Text>
                    </View>
                </View>

                <View style={styles.criteriaCard}>
                    <Text style={styles.cardTitle}>Avaliação por Critério</Text>
                    {Object.keys(notasDetalhadas).map((key) => (
                        <View key={key} style={styles.criteriaRow}>
                            <Text style={styles.criteriaLabel}>
                                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </Text>
                            <Text style={[styles.criteriaValue, { color: getScoreColor(notasDetalhadas[key]) }]}>
                                {notasDetalhadas[key]}/100
                            </Text>
                        </View>
                    ))}
                </View>

                <View style={styles.notesCard}>
                    <View style={styles.cardHeader}>
                        <Ionicons name="chatbox-ellipses-outline" size={20} color="#34D399" />
                        <Text style={[styles.cardTitle, { marginBottom: 0 }]}>Análise Qualitativa</Text>
                    </View>
                    {observacoes.map((nota: string, index: number) => (
                        <View key={index} style={styles.noteItem}>
                            <Ionicons name="caret-forward" size={14} color="#666" style={{ marginTop: 4 }} />
                            <Text style={styles.noteText}>{nota}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.conclusionBox}>
                    <Text style={styles.conclusionLabel}>CONCLUSÃO</Text>
                    <Text style={styles.conclusionText}>
                        {resultado.conclusao || resultado.analise || "Análise concluída."}
                    </Text>
                </View>

            </View>
        ) : (
            <Text style={styles.errorText}>Dados indisponíveis.</Text>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

// ... MANTENHA OS ESTILOS IGUAIS AO ARQUIVO ANTERIOR ...
// (Não precisa alterar nada nos styles)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1C1C1E' },
  content: { padding: 24, paddingBottom: 50 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  backButton: { marginRight: 16 },
  headerTitle: { fontSize: 20, fontFamily: 'Poppins_700Bold', color: '#FFF' },
  candidatoCard: { flexDirection: 'row', alignItems: 'center', marginBottom: 32, backgroundColor: '#2C2C2E', padding: 12, borderRadius: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#34D399', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { fontSize: 18, fontFamily: 'Poppins_700Bold', color: '#1C1C1E' },
  candidatoLabel: { color: '#888', fontSize: 10, fontFamily: 'Poppins_400Regular' },
  candidatoName: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold' },
  originalBox: { marginBottom: 32, padding: 16, borderLeftWidth: 2, borderLeftColor: '#666' },
  boxLabel: { color: '#666', fontSize: 10, fontFamily: 'Poppins_700Bold', marginBottom: 4 },
  originalText: { color: '#CCC', fontSize: 14, fontFamily: 'Poppins_400Regular', fontStyle: 'italic' },
  loadingContainer: { alignItems: 'center', marginTop: 40 },
  loadingText: { color: '#34D399', marginTop: 16, fontSize: 16, fontFamily: 'Poppins_700Bold' },
  loadingSubText: { color: '#666', marginTop: 8, fontSize: 12 },
  resultContainer: { gap: 16 },
  scoreSection: { alignItems: 'center', marginBottom: 8 },
  scoreCircle: { width: 120, height: 120, borderRadius: 60, borderWidth: 8, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2C2C2E' },
  scoreValue: { fontSize: 36, fontFamily: 'Poppins_700Bold' },
  scoreLabel: { color: '#888', fontSize: 12, fontFamily: 'Poppins_400Regular' },
  criteriaCard: { backgroundColor: '#2C2C2E', borderRadius: 12, padding: 16 },
  notesCard: { backgroundColor: 'rgba(52, 211, 153, 0.05)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(52, 211, 153, 0.2)' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  cardTitle: { color: '#FFF', fontSize: 16, fontFamily: 'Poppins_700Bold', marginBottom: 12 },
  criteriaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#3A3A3C', paddingBottom: 8 },
  criteriaLabel: { color: '#CCC', fontSize: 14, fontFamily: 'Poppins_400Regular' },
  criteriaValue: { fontSize: 14, fontFamily: 'Poppins_700Bold' },
  noteItem: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  noteText: { color: '#EEE', fontSize: 14, fontFamily: 'Poppins_400Regular', flex: 1, lineHeight: 20 },
  conclusionBox: { marginTop: 16, padding: 16, backgroundColor: '#252525', borderRadius: 12 },
  conclusionLabel: { color: '#888', fontSize: 10, fontFamily: 'Poppins_700Bold', marginBottom: 8 },
  conclusionText: { color: '#FFF', fontSize: 14, fontFamily: 'Poppins_400Regular', lineHeight: 22 },
  errorText: { color: '#EF4444', textAlign: 'center' }
});