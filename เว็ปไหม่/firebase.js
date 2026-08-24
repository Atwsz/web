const firebaseConfig = {

apiKey: "AIzaSyDKODSRBydM2-0vdmcnoK5qYeW5oAiMRq4",
  authDomain: "manga-sasemi.firebaseapp.com",
  projectId: "manga-sasemi",
  storageBucket: "manga-sasemi.firebasestorage.app",
  messagingSenderId: "779216977959",
  appId: "1:779216977959:web:51622864b05a780e6f4e02",
  measurementId: "G-7D213KEZYN"

};


if(!firebase.apps.length){

firebase.initializeApp(firebaseConfig);

}


const db = firebase.firestore();
const auth = firebase.auth();