// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDYnvcRKt4qDpk08_4MQVNEOr9Iq95X980",
    authDomain: "sps003hjr.firebaseapp.com",
    databaseURL: "https://sps003hjr-default-rtdb.firebaseio.com",
    projectId: "sps003hjr",
    storageBucket: "sps003hjr.firebasestorage.app",
    messagingSenderId: "294133615625",
    appId: "1:294133615625:web:832c4db972dcb1b92cbcd8"
};

// Inicializa Firebase (versão compat)
try {
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
        console.log('✅ Firebase inicializado com sucesso');
    }
} catch (error) {
    console.error('❌ Erro ao inicializar Firebase:', error);
}

// Exporta serviços
const auth = firebase.auth();
const database = firebase.database();

// Log de debug
console.log('📊 Database URL:', firebaseConfig.databaseURL);
console.log('🔌 Database conectado:', !!database);

export { auth, database };
