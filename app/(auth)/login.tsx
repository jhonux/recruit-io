import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, useRouter } from 'expo-router';

export default function LoginScreen() {
    const router = useRouter();

    const handleLogin = () => {

        router.replace('/(tabs)');
    }

    const handleCreateAccount = () => {
        router.push('/(auth)/cadastro');
    }
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <Image source={require('../../assets/images/logo1.png')} style={styles.logo} />

                <Text style={styles.title}>Bem-vindo ao Recruit.io</Text>
                <Text style={styles.subtitle}>A sua plataforma de análise de recrutamento</Text>

                <TextInput
                    style={styles.input}
                    placeholder="Seu e-mail"
                    placeholderTextColor="#888"
                    keyboardType="email-address"
                />

                <TextInput
                    style={styles.input}
                    placeholder="Sua senha"
                    placeholderTextColor="#888"
                    secureTextEntry
                />

                <Text style={styles.forgotPassword}>Esqueceu sua senha?</Text>

                <TouchableOpacity style={styles.buttonPrimary} onPress={handleLogin}>
                    <Text style={styles.buttonPrimaryText}>Entrar</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.buttonCreate} onPress={handleCreateAccount}>
                    <Text style={styles.buttonCreateText}>Criar conta</Text>
                </TouchableOpacity>


            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FEFEFE"
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logo: {
        width: 300,
        height: 100,
        alignSelf: 'center',
        marginBottom: 24,
        resizeMode: 'contain',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#32383D',
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'Poppins_700Bold'
    },
    subtitle: {
        fontSize: 17,
        color: '#32383D',
        textAlign: 'center',
        marginBottom: 32,
        fontFamily: 'Poppins_400Regular'
    },
    input: {
        backgroundColor: '#32383D',
        color: '#32383D',
        height: 50,
        borderRadius: 10,
        fontSize: 16,
        paddingHorizontal: 19,
        marginBottom: 16,
        fontFamily: 'Poppins_400Regular'
    },
    forgotPassword: {
        textAlign: 'right',
        color: '#34D399', 
        marginBottom: 24,
        fontFamily: 'Poppins_400Regular'
    },
    buttonPrimary: {
        backgroundColor: '#34D399', 
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonPrimaryText: {
        color: '#FEFEFE',
        fontSize: 20,
        fontWeight: 'medium',
        fontFamily: 'Poppins_400Regular'
    },
    separator: {
        color: '#680c0cff',
        textAlign: 'center',
        marginVertical: 16,
    },
    buttonSecondary: {
        backgroundColor: '#2C2C2E', // Cinza escuro
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    buttonSecondaryText: {
        color: '#FFF',
        fontSize: 18,
        fontFamily: 'Poppins_400Regular',
    },
    buttonCreate: {
        backgroundColor: '#2C2C2E', // Cinza escuro
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonCreateText: {
        color: '#FFF',
        fontSize: 18,
        fontWeight: 'medium',
        fontFamily: 'Poppins_400Regular',
    },


});