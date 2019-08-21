import Vue from 'vue'
import Router from 'vue-router'
import GMap from '@/components/home/GMap'
import Signup from '@/components/auth/Signup'
import Login from '@/components/auth/Login'
import ViewProfile from '@/components/profile/ViewProfile'
import * as firebase from 'firebase/app'
import 'firebase/auth'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    { // zelimo da zastitimo samo ovu rutu sa router guarding tj da se kucanjem url-a ne moze stici ovde ako nisi ulogovan, ali ovaj x cemo to malo drugacije uraditi nego pr x u chatu
      path: '/',
      name: 'gmap',
      component: GMap,
      meta: {
        requireAuth: true
      }
    },

    {
      path: '/signup',
      name: 'signup',
      component: Signup
    },

    {
      path: '/login',
      name: 'login',
      component: Login
    },

    {
      path: '/profile/:id',
      name: 'view profile',
      component: ViewProfile,
      meta: {
        requireAuth: true
      }
    }
  ]
})

//! ZASTITA RUT AOD NEULOGOVANIH KORISNIKA, DA NE MOZE DA PRISTUPI NEKIM RUTAMA PREKO URL-A AKO NIJE ULOGOVAN
router.beforeEach((to, from, next) => {
  //? check to see if route requires auth
  if(to.matched.some(rec => rec.meta.requireAuth)) // ovo znaci: gledaj gde idemo, i nesto pokusavamo da matchujemo, a sta to. Pa trazimo da li je requiresAuth negde true. A jeste za nasu '/' rutu
  {
    //? check auth state of user
    let user = firebase.auth().currentUser
    if(user) { // ako postoji ulogovan user, nastavi do putanje gde si krenuo
      //? user signed in, proceed to route
      next()
    } else { // ako ne postoji trenutni korisnik, redirektuj ga na login page
      //? no user signed in, redirectto login
      next({ name: 'login' })
    }
  } else { // ako requiresAuth nije true (kao recimo u naredna dve rute signin i login) onda ne moramo da cekiramo ovo i mozemo nastaviti dorute do koje smo krenuli
    next()
  }

})

// i sada recimo ako zelimo da zastitimo ovako jos neku rutu, ne moramo ponovo da pisemo ovu f-ju nego samo dodamo u toj ruti: meta: { requiresAuth: true }  to je to

export default router