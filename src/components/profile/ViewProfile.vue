<template>
    <div v-if="profil" class="view-profile container">
        <div class="card">
            <h2 class="deep-purple-text text-darken-3 center">{{ profil.alias }}'s Wall</h2>

            <ul class="comments">
                <li v-for="(comment, index) in arrComments" :key="index">
                    <p>{{ comment.timestamp }}</p>
                    <div class="deep-purple-text commentFrom">{{ comment.from }}</div>
                    <div class="grey-text text-darken-2 commentContent">{{ comment.content }}</div>
                </li>
            </ul>

            <form @submit.prevent="addComment">
                <div class="field">
                    <label for="comment">Add a comment</label>
                    <input type="text" name="comment" v-model="newComment">
                    <p v-if="feedback">{{ feedback }}</p>
                </div>
            </form>
        </div>
    </div>
</template>

<script>
import db from '@/firebase/init' 
import * as firebase from 'firebase/app'
import 'firebase/auth'
import moment from 'moment'
// import 'firebase/firestore'

export default {
    name: 'ViewProfile',
    data() {
        return {
            profil: null,
            newComment: null,
            feedback: null,
            user: null,
            arrComments: []
        }
    },

    created() { // kada se komponent prvi x ucita/kreira
        let ref = db.collection('users')

        //! get current user za ovo dole from ce nam trebati
        ref.where('authUser_id', '==', firebase.auth().currentUser.uid).get() // ovo ce da dohvati id propery trenutno ulogovanog korisnika, i machovace ga sa firestore-om
            .then(snapshot => {
                snapshot.forEach(doc => {
                    this.user = doc.data()
                    this.user.id = doc.id // slug, i ovaj slug nam treba za ovo from, ko ostavlja komentar
                });
            })

        //! PROFILE DATA
        ref.doc(this.$route.params.id).get()
            .then(korisnik => {
                // console.log(korisnik)
                this.profil = korisnik.data() // i sada ovde u profilu imamo pristup svemu, i geolokaciji, alijasu itd
            }) 
            .catch(err => console.log(err))

        //! COMMENTS
        db.collection('comments').where('to', '==', this.$route.params.id)// dakle idem u comments collection, i dohvatam to field gde je vrednost jednaka vrednosti :id parametra trenutnog url-a, sto mu dodje slug na cijem smo trenutno profilu
        .onSnapshot(snapshot => {
            snapshot.docChanges().forEach(change => {
                if (change.type == 'added') {
                    this.arrComments.unshift({ // umesto push stavljamo unshift jer unshift kao da pushuje na pocetak niza, dakle ono sto smo poslednje komentarisali, bude prvo u nizu ako sam dobro razumela
                        from: change.doc.data().from, // za svaki change koji se desi dohvatamo svezi doc, oa ga pretvaramo u podatke doc-a sa data() ppa dohvatamo property from
                        content: change.doc.data().content,
                        timestamp: moment(change.doc.data().timestamp).format('lll')
                    }) // sada kada ovo sacuvamo dohvatice sve ove komentare (tj polja/fields iz doc-a odnosno collectiona comments) i sacuvati u arrComments
                }
            })
        })
            
    },

    methods: {
        addComment() {
            if(this.newComment) { 
                this.feedback = null

                db.collection('comments').add({
                    to: this.$route.params.id, // kome ostavljamo komentar, a to na cijem smo 'profilu' nam ukazuje tenutna url, odnosno parametar id u url-u (.../profile/:id), taj id se vodi kao sluh, a slug koristimo kao id za doc korisnika
                    from: this.user.alias, // ko komentarise, ovo je malo zajebano. Idemo prvo gore u created() da dohvatimo current korisnika sa firebase auth
                    content: this.newComment,
                    timestamp: Date.now()
                }).then(() => {
                    this.newComment = null // ovo then se okine kada se komenta i ostali podaci posalju bazi i sacuvaju, i onda zelimo da polje u kome je ovaj komentar na frontendu se izbrise, da bi mogao da kuca novi il kako god, zato stavljamo da je null
                })
            } else {
                this.feedback = 'You must enter a comment to add it'
            }
        }
    }
}
</script>

<style lang="scss">
    .view-profile {
        .card {
            padding: 20px;
            margin-top: 60px;
        }

        h2 {
             font-size: 2em;
             margin-top: 0;
        }

        li {
            padding: 10px;
            border-bottom: .5px solid #eee;
        }

        p {
            color: #aaa;
            font-size: .7em;
            margin-bottom: 3px;
        }

        .commentFrom {
            font-size: 1.1em;
            font-weight: 500;
        }
    }
</style>