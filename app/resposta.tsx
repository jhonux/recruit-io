import React, { useState } from 'react';
import { 
  View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { respostaService } from '../services/respostaService';

export default function ResponderScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const perguntaTexto = params.texto as string;
  const perguntaId = params.id as string;

  const [resposta, setResposta] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleEnviar = async () => {
    if (!resposta.trim()) {
      Alert.alert('Campo Obrigatório', 'A resposta não pode estar em branco.');
      return;
    }
    if (resposta.length < 5) {
      Alert.alert('Muito curto', 'Por favor, elabore melhor sua resposta.');
      return;
    }

    setIsLoading(true);

    try {
      await respostaService.enviarResposta(perguntaId, resposta);
      
      Alert.alert(
        'Resposta Enviada! 🚀', 
        'Sua resposta foi recebida com sucesso.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
      
    } catch (error) {
      Alert.alert('Erro', 'Houve um problema ao enviar. Verifique sua conexão.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Sua Resposta</Text>
          </View>

          <View style={styles.questionContainer}>
            <View style={styles.iconContainer}>
              <Feather name="help-circle" size={24} color="#1C1C1E" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.questionLabel}>PERGUNTA TÉCNICA</Text>
              <Text style={styles.questionText}>{perguntaTexto}</Text>
            </View>
          </View>

          <View style={styles.formContainer}>

            <Text style={styles.label}>Sua Solução / Resposta</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Digite sua resposta detalhada aqui..."
              placeholderTextColor="#666"
              multiline
              textAlignVertical="top"
              value={resposta}
              onChangeText={setResposta}
            />

            <View style={styles.tipContainer}>
              <Ionicons name="information-circle-outline" size={20} color="#888" />
              <Text style={styles.tipText}>
                A IA analisará clareza, corretude técnica e exemplos práticos.
              </Text>
            </View>
          </View>

        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.sendButton, isLoading && { opacity: 0.7 }]} 
            onPress={handleEnviar}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#1C1C1E" />
            ) : (
              <>
                <Text style={styles.sendButtonText}>Enviar Resposta</Text>
                <Ionicons name="send" size={20} color="#1C1C1E" />
              </>
            )}
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  content: {
    padding: 24,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: {
    marginRight: 16,
    padding: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  questionContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
    borderLeftWidth: 4,
    borderLeftColor: '#34D399',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34D399',
    justifyContent: 'center',
    alignItems: 'center',
  },
  questionLabel: {
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
    color: '#34D399',
    marginBottom: 4,
    letterSpacing: 1,
  },
  questionText: {
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    color: '#FFF',
    lineHeight: 24,
  },
  formContainer: {
    gap: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins_700Bold',
    color: '#CCC',
    marginLeft: 4,
  },
  textArea: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1,
    borderColor: '#3A3A3C',
    height: 200,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingHorizontal: 4,
  },
  tipText: {
    color: '#888',
    fontSize: 12,
    fontFamily: 'Poppins_400Regular',
    flex: 1,
  },
  footer: {
    padding: 24,
    paddingTop: 10,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  sendButton: {
    backgroundColor: '#34D399',
    height: 56,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  sendButtonText: {
    color: '#1C1C1E',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
});