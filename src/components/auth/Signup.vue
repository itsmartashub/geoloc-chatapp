<template>
    <div class="signup container">
        <form class="card-panel" @submit.prevent="signup">
            <h2 class="center deep-purple-text">Signup</h2>

            <div class="field">
                <label for="email">Email: </label>
                <input type="email" name="email" v-model="email">
            </div>

            <div class="field">
                <label for="password">Password: </label>
                <input type="password" name="password" v-model="password">
            </div>

            <div class="field">
                <label for="alias">Alias: </label>
                <input type="text" name="alias" v-model="alias">
            </div>

            <p v-if="feedback" class="red-text center">{{ feedback }}</p>

            <div class="field center">
                <button class="btn deep-purple">Signup</button>
            </div>
        </form>
    </div>
</template>

<script>
import slugify from 'slugify'
import db from '@/firebase/init'
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'

export default {
    name: 'Signup',

    data() {
        return {
            email: null,
            password: null,
            alias: null,
            feedback: null,
            slug: null
        }
    },

    methods: {
        // e sad, vde cemo imati dve stvari u bazi, naime u FIREBASE AUTH ce se cuvati ovi signup podaci email, password, id, a u FIRESTORE DB ce se cuvati geolokacija (lat, lng) i alias, i sad mi nekako treba da povezemo korisnike iz FIREBASE AUTH i FIRESTORE DB, tako da cemo ovaj id u FIREBASE AUTH da sacuvamo i u promenljivoj recimo user_id u FIRESTORE AUTH
        signup() {
            if(this.alias && this.password && this.email) { // zelimo sada da ovaj alias koji je korisnik uneo, pretvorimo u slug sa slugify-em, zatim zelim da posaljem upit bazi tj cekiracu da li postoji jos neki korisnik sa tim slug-om, ako da, korisnik mora da unese drugi alias, dakle slug ce biti UNIKATAN, on ce nam biti IDENIFIKATOR
                this.slug = slugify(this.alias, { // dakle prvi argument je sta zelimo da slugifyjemo a drugi objekat koji sadrzi razlicite propertyje kojima definisemo kako zelimo slugify da se obavi
                    replacement: '-',
                    remove: /[$*+~.()'"!:@]/g,
                    lower: true
                })
                // console.log(this.slug); 

                let ref = db.collection('users').doc(this.slug) // ovo users jos ne postoji, ali nema veze, on ce sam da napravi, zatim u toj bazi users nadji doc, sa tim i tim id-em, ali sad cemo da koristimo ovaj slug kao id, tj identifikator, da nadje doc/record sa tim slug-om. Dakle inace smo u doc-u imali automatski generisan id, ali sada stavljamo da id bude ovaj uneti slug
                ref.get().then(dok => {
                    if(dok.exists) { // firebase 'metod' exists
                        this.feedback = 'This alias already exist'
                    } else {
                        firebase.auth().createUserWithEmailAndPassword(this.email, this.password) // firebase auth metode, pomaze nam pr registrovanju, tipa ko postoji vec korisnik sa tim i tim emailom nece dozvoliti registrovanje, ili ako je password manji od 6 karaktera i sl. ovo createUserWithEmailAndPassword() prihvata dva agumenta, email i password i to je asinhrona radnja, dakle vraca Promice i mozemo catchovati neki error ako ga ima, i mozemo outputovati taj error u recimo feedback
                        .then(cred => { // ovde zelimo da nakon sto se korisnik uspesno registruje, dakle nakon sto je odradjena FIRESTORE AUTH, zelimo da dohvatimo taj id korisnika i implementiramo ga kao recimo authUser_id u FIREBASE DB, zajedno sa geolokacijom i alijasom. ovo then za parametar u callbacku uzima cred (firebase pravilo)
                            // console.log(cred.user.uid)
                            // i sada zelimo da kreiramo record u nasoj FIRESTORE DB koji ce da se matchuje sa ovim korisnikom, i vec imamo ovu gore referencu za to
                            ref.set({
                                alias: this.alias,
                                geolokacija: null,
                                authUser_id: cred.user.uid // setujemo u doc-u authUser_id koji ce imati vrednost onog u FIREBASE AUTH a njega dohvatamo sa cred.user.uid
                            }) // set() je da setujemo neke podatke. Ovo se razlikuje od add(), add() smo dodavali gore odmah posle db.collection('users').add(). Ali mi hocemo da na vec kreirani doc setujemo neke propertyje/polja/fields

                        })
                        .then(() => { // i kada s eovo gore obavi uspesno, sada ovim then() zelimo da redirektujemo na GMap.vue component
                            this.$router.push({ name: 'gmap'})
                        })
                        .catch(err => {
                            console.log(err)
                            this.feedback = err.message
                        })
                        this.feedback = 'This alias is free to use'
                    }
                })
                console.log(this.slug);

            } else {
                feedback = 'You must enter all fields'
            }
        }
    }
}
</script>

<style lang="scss">
    .signup {
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