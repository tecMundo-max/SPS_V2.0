import { auth, database } from '../firebase/config.js';

// Serviço de autenticação
class AuthService {
    async login(email, password) {
        try {
            const userCredential = await auth.signInWithEmailAndPassword(email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async register(email, password) {
        try {
            const userCredential = await auth.createUserWithEmailAndPassword(email, password);
            
            // Cria perfil inicial no banco
            const userProfile = {
                username: email,
                admin: false,
                role: 'ANALISTA',
                ativo: false,
                createdAt: new Date().toLocaleDateString('pt-BR'),
                email: email
            };
            
            await database.ref(`USERS/${userCredential.user.uid}`).set(userProfile);
            return { success: true, user: userCredential.user };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    async getUserProfile(uid) {
        const snapshot = await database.ref(`USERS/${uid}`).once('value');
        return snapshot.val();
    }

    async logout() {
        await auth.signOut();
    }

    getCurrentUser() {
        return auth.currentUser;
    }
}

export const authService = new AuthService();
