import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { perguntaService } from '../services/perguntaService';

export default function VagasScreen() {
    const router = useRouter();

    const [titulo, setTitulo] = useState('');
    const [perguntas, setPerguntas] = useState(['']);
    const [isLoading, setIsLoading] = useState(false);

    const handleAddPergunta = () => setPerguntas([...perguntas, '']);
    const handleChangePergunta = (text: string, index: number) => {
        const novas = [...perguntas]; novas[index] = text; setPerguntas(novas);
    };

    const handleRemovePergunta = (index: number) => {
        const novas = [...perguntas]; novas.splice(index, 1); setPerguntas(novas);
    };

    const handleSalvar = async () => {
        if (!titulo.trim()) return Alert.alert('Atenção', 'Preencha o título.');

        const perguntasValidas = perguntas.filter(p => p.trim() !== '');
        if (perguntasValidas.length === 0) return Alert.alert('Atenção', 'Adicione perguntas.');

        setIsLoading(true);

        try {
            await perguntaService.criarVariasPerguntas(perguntasValidas, titulo);

            Alert.alert('Sucesso', 'Pergunta criada!');
            router.push('/(tabs)/perguntas');

        } catch (error) {
            Alert.alert('Erro', 'Falha ao conectar com o servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollContent}>

              
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 16 }}>
                        <Ionicons name="arrow-back" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Criar nova pergunta</Text>
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Título da pergunta</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="ex: React"
                        placeholderTextColor="#666"
                        value={titulo}
                        onChangeText={setTitulo}
                    />
                </View>

                {perguntas.map((pergunta, index) => (
                    <View key={index} style={styles.inputGroup}>
                        <View style={styles.labelContainer}>
                            <Text style={styles.label}>Pergunta {index + 1}</Text>
                            {perguntas.length > 1 && (
                                <TouchableOpacity onPress={() => handleRemovePergunta(index)}>
                                    <Ionicons name="trash-outline" size={18} color="#EF4444" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder={`Digite a ${index + 1}ª pergunta...`}
                            placeholderTextColor="#666"
                            multiline
                            textAlignVertical="top"
                            value={pergunta}
                            onChangeText={(text) => handleChangePergunta(text, index)}
                        />
                    </View>
                ))}

                <TouchableOpacity style={styles.addButton} onPress={handleAddPergunta}>
                    <Ionicons name="add" size={24} color="#34D399" />
                    <Text style={styles.addButtonText}>Adicionar pergunta</Text>
                </TouchableOpacity>

            </ScrollView>

            <View style={styles.footer}>
                <TouchableOpacity style={styles.saveButton} onPress={handleSalvar}>
                    <Text style={styles.saveButtonText}>Salvar pergunta</Text>
                </TouchableOpacity>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1C1C1E',
    },
    scrollContent: {
        padding: 24,
        paddingBottom: 100, 
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
    },
    headerTitle: {
        fontSize: 24,
        fontFamily: 'Poppins_700Bold',
        color: '#FFF',
    },
    inputGroup: {
        marginBottom: 24,
    },
    labelContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        color: '#CCC',
        fontSize: 14,
        fontFamily: 'Poppins_400Regular',
    },
    input: {
        backgroundColor: '#2C2C2E',
        borderRadius: 12,
        padding: 16,
        color: '#FFF',
        fontSize: 16,
        fontFamily: 'Poppins_400Regular',
    },
    textArea: {
        height: 100, 
    },
    addButton: {
        borderWidth: 2,
        borderColor: '#34D399',
        borderStyle: 'dashed', 
        borderRadius: 12,
        height: 56,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 32,
    },
    addButtonText: {
        color: '#34D399',
        fontSize: 16,
        fontFamily: 'Poppins_700Bold',
    },
    footer: {
        padding: 24,
        paddingTop: 0,
        backgroundColor: '#1C1C1E', 
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