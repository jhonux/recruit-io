import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PerfilScreen() {
  const router = useRouter();

  const [nome, setNome] = useState('Carregando...');
  const [tipo, setTipo] = useState('');
  const [inicial, setInicial] = useState('?');

  const carregarPerfil = async () => {
    try {
      const nomeSalvo = await AsyncStorage.getItem('user_name');
      const tipoSalvo = await AsyncStorage.getItem('user_type');

      if (nomeSalvo) {
        setNome(nomeSalvo);
        setInicial(nomeSalvo[0].toUpperCase());
      } else {
        setNome('Usuário');
      }

      if (tipoSalvo === 'RECRUITER') {
        setTipo('Recrutador(a)');
      } else {
        setTipo('Candidato(a)');
      }

    } catch (error) {
      console.error('Erro ao carregar perfil', error);
    }
  };

  
  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive", 
          onPress: () => {
            router.replace('/(auth)/login');
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>{inicial}</Text>
        </View>
        <Text style={styles.userName}>{nome}</Text>
        <Text style={styles.userRole}>{tipo}</Text>
        
     
        <TouchableOpacity 
            style={styles.editProfileButton}
            onPress={() => router.push('/editar-perfil')}
        >
            <Text style={styles.editProfileText}>Editar Perfil</Text>
        </TouchableOpacity>
      </View>

      {/* <View style={styles.menuContainer}>
        
        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
                <Ionicons name="settings-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Configurações da Conta</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
                <Ionicons name="notifications-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Notificações</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIcon}>
                <Ionicons name="help-circle-outline" size={20} color="#FFF" />
            </View>
            <Text style={styles.menuText}>Ajuda e Suporte</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>

      </View> */}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#EF4444" />
        <Text style={styles.logoutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Recruit.io v1.0.0 (MVP)</Text>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#34D399', 
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#2C2C2E',
  },
  avatarText: {
    fontSize: 40,
    fontFamily: 'Poppins_700Bold',
    color: '#1C1C1E',
  },
  userName: {
    fontSize: 24,
    fontFamily: 'Poppins_700Bold',
    color: '#FFF',
  },
  userRole: {
    fontSize: 14,
    fontFamily: 'Poppins_400Regular',
    color: '#888',
  },
  menuContainer: {
    backgroundColor: '#2C2C2E',
    borderRadius: 16,
    padding: 8,
    marginBottom: 32,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#3A3A3C',
  },
  menuIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#3A3A3C',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Poppins_400Regular',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EF4444',
    gap: 8,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontFamily: 'Poppins_700Bold',
  },
  versionText: {
    textAlign: 'center',
    color: '#444',
    marginTop: 24,
    fontFamily: 'Poppins_400Regular',
    fontSize: 12,
  },
  editProfileButton: {
    marginTop: 12,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#34D399',
  },
  editProfileText: {
    color: '#34D399',
    fontSize: 12,
    fontFamily: 'Poppins_700Bold',
  },
});