import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// VARIÁVEIS GLOBAIS DE AUTENTICAÇÃO/CONFIGURAÇÃO (se aplicável ao seu ambiente)
// const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
// const firebaseConfig = JSON.parse(__firebase_config);

// Configuração fornecida pelo usuário
const firebaseConfig = {
  apiKey: "AIzaSyD5CrQot4JtLMN82RI9HPZgYOiLc1Zfais",
  authDomain: "projetoreactfirebase-2a266.firebaseapp.com",
  projectId: "projetoreactfirebase-2a266",
  storageBucket: "projetoreactfirebase-2a266.appspot.com",
  messagingSenderId: "948768294490",
  appId: "1:948768294490:web:f8f71e814d397c934c7a63",
  measurementId: "G-FFMMKTQ2NN",
};

const firebaseApp = initializeApp(firebaseConfig);

// EXPORTAÇÕES NOMEADAS: db e auth
export const db = getFirestore(firebaseApp);
export const auth = getAuth(firebaseApp);
// EXPORTAÇÃO DEFAULT: A instância do App (menos usada, mas mantida)
export default firebaseApp;