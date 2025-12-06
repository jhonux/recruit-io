import { Stack } from 'expo-router';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as Updates from 'expo-updates';
import { Alert } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();

      if (update.isAvailable) {
        Alert.alert(
          "Atualização Disponível 🚀",
          "Uma nova versão do Recruit.io foi baixada. O app será reiniciado para aplicar as mudanças.",
          [
            { 
              text: "Atualizar Agora", 
              onPress: async () => {
                await Updates.fetchUpdateAsync();
                await Updates.reloadAsync();
              } 
            },
            { text: "Depois", style: "cancel" } 
          ]
        );
      }
    } catch (error) {
      // Ignora erros de update em dev
      if (!__DEV__) console.error(`Erro ao buscar update: ${error}`);
    }
  }

  useEffect(() => {
    // Verifica updates assim que o app abre (apenas em produção/preview)
    if (!__DEV__) {
      onFetchUpdateAsync();
    }
  }, []);
  
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