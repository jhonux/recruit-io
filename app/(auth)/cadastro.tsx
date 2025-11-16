import { Link } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CadastroScreen() {
    const [tipoUsuario, setTipoUsuario] = React.useState('recrutador');

    return (
        <SafeAreaView style={styles.container}>

            <View style={styles.content}>
                <Image source={require('../../assets/images/logo2.png')} style={styles.logo} />

                <Text style={styles.title}>Criar sua conta</Text>
                <Text style={styles.subtitle}>Preencha os campos para começar.</Text>

                <Text style={styles.label}>Eu sou</Text>
                <View style={styles.toggleContainer}>
                    <Pressable
                        style={[
                            styles.toggleButton,
                            tipoUsuario === 'recrutador' ? styles.toggleActive : styles.toggleInactive,
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

                <TextInput
                    style={styles.input}
                    placeholder="Nome completo"
                    placeholderTextColor="#888"
                />
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
                    secureTextEntry={true}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Confirme sua senha"
                    placeholderTextColor="#888"
                    secureTextEntry={true}
                />

                {/* <Text style={styles.errorText}>Senhas não conferem.</Text> */}


                <TouchableOpacity style={styles.buttonPrimary}>
                    <Text style={styles.buttonPrimaryText}>Cadastrar</Text>
                </TouchableOpacity>


                <Link href="/" style={styles.loginLink}>
                    Já possui uma conta? Faça login
                </Link>

            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#32383D"
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    logo: {
        height: 100,
        alignSelf: 'center',
        resizeMode: 'contain',
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#FEFEFE',
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 17,
        color: '#FEFEFE',
        textAlign: 'center',
        marginBottom: 32,
    },
    label: {
        fontSize: 16,
        color: '#32383D',
        marginBottom: 8,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#5A636B',
        borderRadius: 8,
        marginBottom: 16,
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
        backgroundColor: 'rgba(72, 218, 167, 0.5)',
    },
    toggleInactive: {
        backgroundColor: 'transparent',
    },
    toggleText: {
        color: '#2FEDAA',
        fontWeight: '500',
        fontFamily: 'Poppins_400Regular',
    },
    input: {
        backgroundColor: '#5A636B',
        color: '#32383D',
        height: 50,
        borderRadius: 10,
        fontSize: 16,
        paddingHorizontal: 19,
        marginBottom: 16,
    },
    errorText: {
        color: '#EF4444',
        marginBottom: 16,
        textAlign: 'center',
    },
    buttonPrimary: {
        backgroundColor: '#34D399',
        height: 50,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 16,
    },
    buttonPrimaryText: {
        color: '#FEFEFE',
        fontSize: 20,
        fontWeight: 'medium',
    },
    loginLink: {
        color: '#34D399',
        textAlign: 'center',
        marginTop: 16,
    },
});