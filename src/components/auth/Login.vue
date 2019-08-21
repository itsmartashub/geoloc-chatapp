<template>
    <div class="login container">
        <form class="card-panel" @submit.prevent = 'login'>
            <h2 class="center deep-purple-text">Login</h2>

            <div class="field">
                <label for="email">Email: </label>
                <input type="email" name="email" v-model="email">
            </div>

            <div class="field">
                <label for="password">Password: </label>
                <input type="password" name="password" v-model="password">
            </div>

            <p v-if="feedback" class="red-text center">{{ feedback }}</p>

            <div class="field center">
                <button class="btn deep-purple">Login</button>
            </div>

        </form>
    </div>
</template>

<script>
import * as firebase from "firebase/app";
import 'firebase/auth'
import 'firebase/firestore'

export default {
    name: 'Login',

    data() {
        return {
            email: null,
            password: null,
            feedback: null
        }
    },

    methods: {
        login() {
            // console.log(this.email, this.password);
            if(this.email && this.password) {
                firebase.auth().signInWithEmailAndPassword(this.email, this.password)
                .then((cred) => {
                    // console.log(cred.user);
                    this.$router.push({ name: 'gmap' })
                })
                .catch(err => {
                    console.log(err);
                    this.feedback = err.message
                })

                this.feedback = null
            } else {
                this.feedback = 'Please fill in both fields'
            }
        }
    }
}
</script>

<style>

</style>