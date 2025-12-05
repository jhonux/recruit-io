import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { authService } from '../../services/authService';

export default function LoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Erro', 'Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      const usuario = await authService.login(email, senha);

      if (usuario.tipoUsuario === 'RECRUITER') {
        router.replace('/(tabs)');
      } else {
        router.replace('/(candidato)')
      }

      } catch (error) {
        Alert.alert('Falha no Login', 'Verifique suas credenciais e tente novamente.');
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1, justifyContent: 'center' }}
        >
          <View style={styles.content}>

          
            <View style={styles.header}>
              <Image source={require('../../assets/images/logo2.png')} style={styles.logo} />
              <Text style={styles.subtitle}>Solução para recrutamento inteligente</Text>
            </View>
            
            <View style={styles.form}>

            
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Seu e-mail"
                  placeholderTextColor="#666"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

            
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#888" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Sua senha"
                  placeholderTextColor="#666"
                  secureTextEntry={!showPassword}
                  value={senha}
                  onChangeText={setSenha}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#888"
                  />
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={{ alignSelf: 'flex-end', marginBottom: 24 }}>
                <Text style={styles.forgotPassword}>Esqueceu a senha?</Text>
              </TouchableOpacity>

            
              <TouchableOpacity
                style={[styles.loginButton, isLoading && { opacity: 0.7 }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <ActivityIndicator color="#1C1C1E" />
                ) : (
                  <Text style={styles.loginButtonText}>Entrar</Text>
                )}
              </TouchableOpacity>

         
              <View style={styles.footer}>
                <Text style={styles.footerText}>Não tem uma conta? </Text>
                <Link href="/cadastro" asChild>
                  <TouchableOpacity>
                    <Text style={styles.linkText}>Cadastre-se</Text>
                  </TouchableOpacity>
                </Link>
              </View>

            </View>
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
    },
    header: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logo: {
      width: 500,
      height: 100,
      resizeMode: 'contain',
      alignSelf: 'center',
    },
    title: {
      fontSize: 28,
      fontFamily: 'Poppins_700Bold',
      color: '#FFF',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      fontFamily: 'Poppins_400Regular',
      color: '#888',
      textAlign: 'center',
    },
    form: {
      width: '100%',
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#2C2C2E',
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#3A3A3C',
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      color: '#FFF',
      fontSize: 16,
      fontFamily: 'Poppins_400Regular',
      height: '100%',
    },
    forgotPassword: {
      color: '#34D399',
      fontSize: 14,
      fontFamily: 'Poppins_400Regular',
    },
    loginButton: {
      backgroundColor: '#34D399',
      height: 56,
      borderRadius: 12,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    loginButtonText: {
      color: '#1C1C1E',
      fontSize: 18,
      fontFamily: 'Poppins_700Bold',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    footerText: {
      color: '#888',
      fontSize: 14,
      fontFamily: 'Poppins_400Regular',
    },
    linkText: {
      color: '#34D399',
      fontSize: 14,
      fontFamily: 'Poppins_700Bold',
    },
  });