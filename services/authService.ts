import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'https://recruit-io-backend.vercel.app/api';

export const authService = {

    cadastrar: async (nome: string, email: string, senha: string, tipo: string) => {
        try {

            const tipoLimpo = tipo.toLowerCase().trim();

            let tipoParaBackend = 'USER'; 

            if (tipoLimpo === 'recrutador') {
                tipoParaBackend = 'RECRUITER';
            }

            
            console.log(" Cadastro - Tipo na Tela:", tipo);
            console.log(" Cadastro - Tipo enviado pro Back:", tipoParaBackend);

            const response = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    nome: nome,
                    email: email,
                    senha: senha,
                    tipoUsuario: tipoParaBackend
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Erro ao criar conta');
            }

            return await response.json();
        } catch (error) {
            console.error('Erro no cadastro:', error);
            throw error;
        }
    },

    login: async (email: string, senha: string) => {
        try {
            const response = await fetch(`${API_URL}/usuarios/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email,
                    senha: senha,
                }),
            });


            if (!response.ok) {
                const errorText = await response.text();
                console.error('❌ Erro Login:', response.status, errorText);
                throw new Error('Email ou senha incorretos.');
            }

            const data = await response.json();
            console.log("✅ Login Sucesso:", data);

            const usuario = data.usuario || data;

            if (usuario.id) await AsyncStorage.setItem('user_id', usuario.id);
            if (usuario.nome) await AsyncStorage.setItem('user_name', usuario.nome);
            if (usuario.email) await AsyncStorage.setItem('user_email', usuario.email);

            if (usuario.tipoUsuario) {
                await AsyncStorage.setItem('user_type', usuario.tipoUsuario);
            }

            return usuario;

        } catch (error) {
            console.error('Erro no login:', error);
            throw error;
        }
    },

    logout: async () => {
        await AsyncStorage.multiRemove(['user_id', 'user_name', 'user_email', 'user_type']);
    },

    getUserId: async () => {
        return await AsyncStorage.getItem('user_id');
    },

    getUserName: async () => {
        return await AsyncStorage.getItem('user_name');
    },


    atualizarUsuario: async (id: string, dados: { nome?: string, email?: string, tipoUsuario?: string }) => {
        try {
            console.log("📤 Atualizando usuário:", id, dados);

            const response = await fetch(`${API_URL}/usuarios/${id}`, {
                method: 'PUT', // ou PATCH
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dados),
            });

            if (!response.ok) {
                throw new Error('Erro ao atualizar perfil.');
            }

            const usuarioAtualizado = await response.json();

            if (usuarioAtualizado.nome) await AsyncStorage.setItem('user_name', usuarioAtualizado.nome);
            if (usuarioAtualizado.email) await AsyncStorage.setItem('user_email', usuarioAtualizado.email);
            if (usuarioAtualizado.tipoUsuario) {
                await AsyncStorage.setItem('user_type', usuarioAtualizado.tipoUsuario);
            }

            return usuarioAtualizado;
        } catch (error) {
            console.error('Erro na atualização:', error);
            throw error;
        }
    },
};