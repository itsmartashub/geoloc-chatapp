import Vue from 'vue'
import App from './App.vue'
import router from './router'
import firebase from 'firebase/app'
import 'firebase/auth'

Vue.config.productionTip = false

let app = null

// wait for firebase auth to init before creating the app
firebase.auth().onAuthStateChanged(() => { // ovo onAuthStateChanged() detektuje kada je stanje u autentifikaciji promenjeno. Dakle ovde ce da detektuje da li je loged in, ili je loged out i sejvovace to i renderovace komponent. Dakle sad ovo stavimo ovu Vue instancu

  // init app if not already created

  if(!app) { // dakle ako app NIJE NULL (a u js-u !null je true) onda je resenje if-a true, i onda se ovo dole vrsi
    app = new Vue({
      router,
      render: h => h(App)
    }).$mount('#app')
    // nakon ovoga app sada vise nije null vec ima ovu Vue instanca vrednost. I onda sledeci x kada se okine onAuthStageChange() event ovo app u ifu ce da bude ova instanca, i onda if(!ovaInstanca) onda se renderuje opet, ali posto jeste, tj bice false, ne renderuje se opet ta instanca. Sada mozemo da obrisemo onaj setTimeout u GMap, to j bilo samo test
  }
   
}) // medjutim, mi zelimo samo jednom da se inicijalizuje app, a to je kada se prvi x dodje na sajt ili kada se rifresuje stranica. NE ZELIMO da inicijalizujemo app svaki x kada se korisnik uloguje ili izloguje jer ova f-ja onAuthStateChanged() se opali svaki x kada se korisnik uloguje ili izloguje, dakle kad god je auth stanje promennjeno. Stoga nam treba nacin da preventujemo ovo. Pa cemo prvo kreirati lokalnu varijablu app da bude null. Onda cemo proveriti da li app postoji

// new Vue({
//   router,
//   render: h => h(App)
// }).$mount('#app')
