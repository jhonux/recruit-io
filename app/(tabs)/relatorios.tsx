// Cole isso em vagas.tsx, relatorios.tsx e perfil.tsx
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.text}>Tela em Construção</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#1C1C1E', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  text: { 
    color: '#FFF', 
    fontFamily: 'Poppins_700Bold', 
    fontSize: 20 
  },
});