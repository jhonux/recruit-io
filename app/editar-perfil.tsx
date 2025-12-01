import React, { useState, useEffect } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
    Pressable
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/authService';

export default function EditarPerfilScreen() {
    const router = useRouter();

    const [id, setId] = useState('');
    const [nome, setNome] = useState('');
    const [email, setEmail] = useState('');
    const [tipoUsuario, setTipoUsuario] = useState('');
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        const userId = await AsyncStorage.getItem('user_id');
        const userName = await AsyncStorage.getItem('user_name');
        const userEmail = await AsyncStorage.getItem('user_email');
        const userType = await AsyncStorage.getItem('user_type');

        if (userType) setTipoUsuario(userType);

        if (userId) setId(userId);
        if (userName) setNome(userName);
        if (userEmail) setEmail(userEmail);
    };

    const handleSalvar = async () => {
        if (!nome.trim() || !email.trim()) {
            Alert.alert('Erro', 'Nome e E-mail são obrigatórios.');
            return;
        }

        setLoading(true);

        try {
            await authService.atualizarUsuario(id, {
                nome: nome,
                email: email,
                tipoUsuario: tipoUsuario,

            });

            Alert.alert('Sucesso', 'Perfil atualizado!', [
                { text: 'OK', onPress: () => router.back() }
            ]);

        } catch (error) {
            Alert.alert('Erro', 'Não foi possível atualizar. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.content}>


                    <View style={styles.form}>
            
     
            <Text style={styles.label}>Tipo de Conta</Text>
            <View style={styles.toggleContainer}>
              <Pressable
                style={[
                  styles.toggleButton, 
                  tipoUsuario === 'RECRUITER' ? styles.toggleActive : styles.toggleInactive
                ]}
                onPress={() => setTipoUsuario('RECRUITER')}
              >
                <Text style={styles.toggleText}>Recrutador</Text>
              </Pressable>
              
              <Pressable
                style={[
                  styles.toggleButton, 
                  tipoUsuario === 'USER' ? styles.toggleActive : styles.toggleInactive
                ]}
                onPress={() => setTipoUsuario('USER')}
              >
                <Text style={styles.toggleText}>Candidato</Text>
              </Pressable>
            </View>

            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Seu nome"
              placeholderTextColor="#666"
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor="#666"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

        </ScrollView>

      
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.saveButton, loading && { opacity: 0.7 }]} 
            onPress={handleSalvar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1C1C1E" />
            ) : (
              <Text style={styles.saveButtonText}>Salvar Alterações</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  backButton: { marginRight: 16 },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34D399',
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: 'Poppins_700Bold',
    color: '#1C1C1E',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2C2C2E',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1C1C1E',
  },
  form: { gap: 16 },
  label: {
    color: '#CCC',
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    marginLeft: 4,
  },
  toggleContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
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
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  toggleText: {
    color: '#FFF',
    fontFamily: 'Poppins_700Bold',
  },
  // Inputs
  input: {
    backgroundColor: '#2C2C2E',
    borderRadius: 12,
    padding: 16,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
    borderWidth: 1,
    borderColor: '#3A3A3C',
  },
  footer: {
    padding: 24,
    backgroundColor: '#1C1C1E',
    borderTopWidth: 1,
    borderTopColor: '#2C2C2E',
  },
  saveButton: {
    backgroundColor: '#34D399',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#1C1C1E',
    fontSize: 18,
    fontFamily: 'Poppins_700Bold',
  },
});