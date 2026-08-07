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

// Inicializa Firebase
firebase.initializeApp(firebaseConfig);

// Exporta serviços
const auth = firebase.auth();
const database = firebase.database();

export { auth, database };
