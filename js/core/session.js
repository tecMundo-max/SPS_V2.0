import appContext from './appContext.js';
import { authService } from '../services/authService.js';

// Gerenciador de sessão
class SessionManager {
    async init() {
        return new Promise((resolve) => {
            auth.onAuthStateChanged(async (user) => {
                if (user) {
                    appContext.setUser(user);
                    const profile = await authService.getUserProfile(user.uid);
                    appContext.setUserProfile(profile);
                } else {
                    appContext.clear();
                }
                resolve();
            });
        });
    }

    async requireAuth(redirectTo = 'login.html') {
        if (!appContext.isAuthenticated) {
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    async requireAdmin(redirectTo = 'dashboard.html') {
        if (!appContext.isAdmin) {
            alert('Acesso restrito a supervisores!');
            window.location.href = redirectTo;
            return false;
        }
        return true;
    }

    logout() {
        return auth.signOut();
    }
}

export const sessionManager = new SessionManager();
