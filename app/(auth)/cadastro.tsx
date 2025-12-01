import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, TouchableOpacity, Pressable, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';
import { authService } from '../../services/authService';

export default function CadastroScreen() {
  const router = useRouter();
  
  // Estados do Formulário
  const [tipoUsuario, setTipoUsuario] = useState('recrutador'); // 'recrutador' ou 'candidato'
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  const handleCadastro = async () => {
    // 1. Validações Básicas
    if (!nome || !email || !senha || !confirmarSenha) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert('Erro', 'As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      // 2. Chama o Serviço
      await authService.cadastrar(nome, email, senha, tipoUsuario);

      // 3. Sucesso
      Alert.alert(
        'Conta Criada! 🎉', 
        'Sua conta foi criada com sucesso. Faça login para continuar.',
        [
          { text: 'Ir para Login', onPress: () => router.replace('/(auth)/login') }
        ]
      );

    } catch (error) {
      Alert.alert('Erro no Cadastro', 'Não foi possível criar a conta. Verifique se o e-mail já existe.');
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
        <ScrollView contentContainerStyle={styles.scrollContent}>
          
          <View style={styles.content}>
            <Text style={styles.title}>Criar sua conta</Text>
            <Text style={styles.subtitle}>Preencha os campos para começar.</Text>

            {/* Seletor de Tipo de Usuário */}
            <Text style={styles.label}>Eu sou</Text>
            <View style={styles.toggleContainer}>
              <Pressable
                style={[
                  styles.toggleButton, 
                  tipoUsuario === 'recrutador' ? styles.toggleActive : styles.toggleInactive
                ]}
                onPress={() => setTipoUsuario('recrutador')}
              >
                <Text style={styles.toggleText}>Recrutador</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.toggleButton, 
                  tipoUsuario === 'candidato' ? styles.toggleActive : styles.toggleInactive
                ]}
                onPress={() => setTipoUsuario('candidato')}
              >
                <Text style={styles.toggleText}>Candidato</Text>
              </Pressable>
            </View>
            
            {/* Inputs */}
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#888"
              value={nome}
              onChangeText={setNome}
            />
            <TextInput
              style={styles.input}
              placeholder="Seu e-mail"
              placeholderTextColor="#888"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Sua senha"
              placeholderTextColor="#888"
              secureTextEntry={true}
              value={senha}
              onChangeText={setSenha}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirme sua senha"
              placeholderTextColor="#888"
              secureTextEntry={true}
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            {/* Botão Cadastrar */}
            <TouchableOpacity 
              style={[styles.buttonPrimary, isLoading && { opacity: 0.7 }]} 
              onPress={handleCadastro}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#1C1C1E" />
              ) : (
                <Text style={styles.buttonPrimaryText}>Cadastrar</Text>
              )}
            </TouchableOpacity>
            
            {/* Link para Login */}
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.loginLink}>Já possui uma conta? Faça login</Text>
              </TouchableOpacity>
            </Link>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins_400Regular',
    textAlign: 'center',
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: '#FFF',
    marginBottom: 8,
    fontFamily: 'Poppins_400Regular',
  },
  // Toggle (Botões de Seleção)
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    gap: 16,
  },
  toggleButton: {
    flex: 1,
    padding: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  toggleActive: {
    backgroundColor: '#34D399',
  },
  toggleInactive: {
    backgroundColor: '#2C2C2E',
  },
  toggleText: {
    color: '#FFF', // Ajuste a cor se necessário para contraste
    fontFamily: 'Poppins_700Bold',
  },
  // Inputs
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFF',
    height: 50,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    marginBottom: 16,
  },
  buttonPrimary: {
    backgroundColor: '#34D399',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimaryText: {
    color: '#1C1C1E',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
  loginLink: {
    color: '#34D399',
    textAlign: 'center',
    marginTop: 24,
    fontFamily: 'Poppins_700Bold',
  },
});