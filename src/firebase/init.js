import * as firebase from 'firebase/app'
import 'firebase/firestore'
// import 'firebase/auth'

// Your web app's Firebase configuration
var firebaseConfig = {
apiKey: "AIzaSyCSpzAl_VYTi7LvajSHy23wldIcM5zMlrQ",
authDomain: "geoloc-chatapp.firebaseapp.com",
databaseURL: "https://geoloc-chatapp.firebaseio.com",
projectId: "geoloc-chatapp",
storageBucket: "",
messagingSenderId: "961864611796",
appId: "1:961864611796:web:c5406b758d6a5e53"
};
// Initialize Firebase
const firebaseApp = firebase.initializeApp(firebaseConfig);

export default firebaseApp.firestore()