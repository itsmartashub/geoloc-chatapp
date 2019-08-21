<template>
    <div class="navbar">
        <nav class="deep-purple darken-1">
            <div class="container">
                <router-link :to="{ name: 'gmap' }" class="brand-logo left">|| GeoLoc Connect ||</router-link>
                <ul class="right">
                    <li v-if="!korisnik"><router-link :to="{ name: 'signup' }">Signup</router-link></li>
                    <li v-if="!korisnik"><router-link :to="{ name: 'login' }">Login</router-link></li>
                    <li v-if="korisnik"><router-link :to="{ name: 'view profile', params: { id: currentUserSlug } }">{{ korisnik.email }}</router-link></li>
                    <!-- <li v-if="korisnik"><a>{{ korisnik.email }}</a></li> -->
                    <li v-if="korisnik"><a @click="logout">Logout</a></li>
                    <!-- Za logout nam ne treba eki poseban component jer ne prikazujemo nista, samim tim nam ne treba ni router link. Ovde cemo taviti click event kojim cemo se logoutovati koristeci firebase auth service -->
                </ul>
            </div>
        </nav>
    </div>
</template>

<script>
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import db from '@/firebase/init'

export default {
   name: 'Navbar',
   data() {
       return {
            korisnik: null,
            currentUserSlug: null
       }
   },

   methods: {
       logout() { // i za logout koristicemo firebase auth service, tj moramo i ovde da importujemo firebase
            firebase.auth().signOut().then(() => {
                this.$router.push({ name: 'login' })
            }) // zapamti, kad god radimo nesto sa firebase autentifikacijom, koristimo firebase.auth () PRVO, da bi dobili taj firebase authentification service. SignOut() je asinhron metod, sto znaci da c emu trebati neko vreme da se odradi i vraca Promice, sto dalje znaci da mozemo koristiti then() u kom cemo da kazemo sta radimo dalje nakon sto se koristin izloguje => redirektovacemo ga na login page
       }
   },

   created() { // da sakrijemo signup i login, a ostavimo logout ako je korisnik ulogovan, i da sarijemo logout a ostavimo signin login ako korisnim nije ulogovan
        // let korisnik = firebase.auth().currentUser // ne mozemo ovde ovako jer se created() vrsi samo jednom, a nama treba da sve vreme osluskujemo da li je korisnik ulogovan ili nije, a sta je bese najbolje za to? onAuthStageChange() firebase auth metod
        firebase.auth().onAuthStateChanged((user) => {
            if(user) { // ako ima user znaci da je ulogovan
                this.korisnik = user // logged in
                // console.log(this.korisnik.email);
                db.collection('users').where('authUser_id', '==', this.korisnik.uid).get()
                    .then(snapshot => {
                        snapshot.forEach(doc => {
                            // console.log(doc.id)
                            this.currentUserSlug = doc.id
                        })
                    })

            } else {
                this.korisnik = null // logged out
            }
        })


   }
}
</script>

<style lang="scss">
    .login {
        max-width: 400px;
        margin-top: 60px;

        h2 {
            font-size: 2.4em;
        }

        .field {
           margin-bottom: 16px;  
        }
    }
</style>