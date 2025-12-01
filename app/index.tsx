import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function StartPage() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    verificarLogin();
  }, []);

  const verificarLogin = async () => {
    try {
      
      const userId = await AsyncStorage.getItem('user_id');
      const userType = await AsyncStorage.getItem('user_type');

      if (!userId) {
        router.replace('/(auth)/login');
      } else {
       
        if (userType === 'RECRUITER') {
          router.replace('/(tabs)');
        } else {
          
          router.replace('/(candidato)');
        }
      }
    } catch (error) {
      
      router.replace('/(auth)/login');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#1C1C1E', justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" color="#34D399" />
    </View>
  );
}