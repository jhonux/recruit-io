import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync(); 
    }
  }, [fontsLoaded]);

 
  if (!fontsLoaded) {
    return null;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="criar-pergunta" options={{ headerShown: false}} />
      <Stack.Screen name="detalhes-pergunta" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      <Stack.Screen name="(candidato)" options={{ headerShown: false }} />
      <Stack.Screen name="respostas-pergunta" options={{ headerShown: false }} />
      <Stack.Screen name="resposta" options={{ headerShown: false }} />
      <Stack.Screen name="analise-ia" options={{ headerShown: false }} />
      <Stack.Screen name="editar-perfil" options={{ headerShown: false }} />
      <Stack.Screen name="candidatos-ranqueados" options={{ headerShown: false }} />
      <Stack.Screen name="ranking-tag" options={{ headerShown: false }} />
    </Stack>
  );
}