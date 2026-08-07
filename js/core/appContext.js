// Contexto global da aplicação
class AppContext {
    constructor() {
        this.currentUser = null;
        this.userProfile = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
    }

    setUser(user) {
        this.currentUser = user;
        this.isAuthenticated = !!user;
    }

    setUserProfile(profile) {
        this.userProfile = profile;
        this.isAdmin = profile?.admin || false;
    }

    clear() {
        this.currentUser = null;
        this.userProfile = null;
        this.isAuthenticated = false;
        this.isAdmin = false;
    }

    getUserEmail() {
        return this.currentUser?.email || '';
    }

    getUsername() {
        return this.userProfile?.username || this.currentUser?.email?.split('@')[0] || '';
    }

    getRole() {
        return this.userProfile?.role || 'ANALISTA';
    }
}

// Singleton
const appContext = new AppContext();
export default appContext;
