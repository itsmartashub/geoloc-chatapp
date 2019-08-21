<template>
   <div class="map">
       <div class="yandex-map" id="map"></div>
   </div>
</template>

<script>
import * as firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/firestore'
import db from '@/firebase/init'


export default {
    name: 'GMap',
    data() {
        return {
            // srbija
            // lat: 44.0165,
            // lng: 21.0059

            lat: 28,
            lng: 31
        }
    },

    methods: {
        renderMap() {
            // GOOGLE api
            // const map = new google.maps.Map(document.getElementById('map'), {
            //     center: { lat: this.lat, lng: this.lng }
            // })

            // OPENLAYERS
            // const map = new ol.Map({
            //     target: 'map',
            //     layers: [
            //         new ol.layer.Tile({
            //             source: new ol.source.OSM()
            //         })
            //     ],
            //     view: new ol.View({
            //         center: ol.proj.fromLonLat([this.lon, this.lat]),
            //         zoom: 6
            //     })
            // })

            // MAPBOX api
            // mapboxgl.accessToken = 'pk.eyJ1IjoiYmlyZXNtYXJ0YSIsImEiOiJjanY5bmVpaGcxM2IzM3lxcHg2eTVnNXFkIn0.sgI0ejJCgxnNUA3W1Gs8Aw';
            // var map = new mapboxgl.Map({
            //     container: 'map',
            //     style: 'mapbox://styles/mapbox/streets-v11',
            //     center: [this.lon, this.lat],
            //     zoom: 5
            // })

            // YANDEX MAP API
            const map = new ymaps.Map("map", { // ovo "map" je id onog gore diva, mogli smo umesto tog stringa i document.getElementById('map')
                center: [this.lat, this.lng],
                zoom: 3
            });
            // console.log(map.geoObjects);

            // zelimo da dohvatimo geolocation svih korisnika i stavimo placemark za sve korisnike na mapu
            db.collection('users').get().then(korisnici => {
                korisnici.docs.forEach(dok => {
                    let data = dok.data()
                    if(data.geolokacija) {
                        let placemark =  new ymaps.Placemark([data.geolokacija.lat, data.geolokacija.lng], {}, { preset: 'islands#redIcon' })

                        map.geoObjects.add(placemark) // yandex api

                        placemark.events.add('click', () => { // yandex api
                            this.$router.push({ name: 'view profile', params: {id: dok.id} })
                        });
                    }
                })
            })


            // Creating a placemark.
            // let placemark = new ymaps.Placemark([this.lat, this.lng], {
            //     // balloonContent: '&lt;img src="http://img-fotki.yandex.ru/get/6114/82599242.2d6/0_88b97_ec425cf5_M" /&gt;',
            //     // iconContent: "Azerbaijan"
            // // }, {
            // //     preset: "islands#yellowStretchyIcon",
            // //     // Disabling the close balloon button.
            // //     balloonCloseButton: false,
            // //     // The balloon will open and close when the placemark icon is clicked.
            // //     hideIconOnBalloonOpen: false
            // });
            // map.geoObjects.add(placemark);
        }
    },

    mounted() { // lifecycle hook function
        // necemo odmah ovde renderovati mapu, nego cemo kreirati u methods: f-ju koja ce renderovati mapu. A to je jer cemo mozda kasnije hteti jos negde renderovati mapu, a ne samo u mounted() pa da to lepo imamo u f-ji
        // this.renderMap()

        //? get current user
          let user = firebase.auth().currentUser
        //   console.log(user.uid);

        //? get user geolocation, moramo cekirati da li taj geolocation api postoji u browseru posto ne postoji u svakom brosweru
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(pos => { // ovim dohvatamokorisnikovu trenutnu lokaciju, ovo je asinhron task, i mozemo korisiti callback f-ju unutas getCurrentPosition
                //? trazimo lat i lng te pozicije, i updajtujemo nase this.lat i this.lng sa tim
                this.lat = pos.coords.latitude
                this.lng = pos.coords.longitude

                //? find the user record and then update geo coords
                db.collection('users').where("authUser_id", '==', user.uid).get()// dakle dohvati bazu users i doc gde je authUser_id jednak ovom ovde user.uid tj id trenutno ulogovanog korisnika
                    .then(snapshot => { // a onda dohvati identifikator korisnika tog doka tj slug
                        snapshot.forEach(doc => {
                            // console.log(doc.id) // ovo doc.id nece biti id!!! Seti se, to ce biti slug!!
                            db.collection('users').doc(doc.id).update({
                                geolokacija: {
                                    lat: pos.coords.latitude,
                                    lng: pos.coords.longitude
                                }
                            })
                        })
                    }).then(() => { // kada se sve ovo izvrsi, zavrsi, onda renderuj mapu sa ovim podacima
                            ymaps.ready(this.renderMap)
                    })
                  
            }, (err) => {
                console.log(err)
                ymaps.ready(this.renderMap) // i ako imamo error, svakako zelimo da renderujemo mapu sa onim gore difoltnim podacima lat i lng
            }, { maximumAge: 60000, timeout: 3000}) // maximumAge ce traziti cashed geolocation korisnika u poslednjih sat vremena, ako postoji, koristicemo taj geolocation, a timeout: 3000 znaci da cemo da trazimo taj cache 3s, ako ne pronadje, samo cemo renderovati mapu
            ymaps.ready(this.renderMap)

        } else { // ako broeser ne podrzava geolocation, dakle opet cemo renderovati mapu sa onim gore difoltnim podacima
            //? position center by default values
            ymaps.ready(this.renderMap) 
        }

        // ali ono sto mi zelimo jeste da kad god se korisnik signup ili login, redirektujemo na GMap.vue i da dohvatimo te lng i lat vrednosti tog korisnika i sacuvamo u bazi
         


        // ymaps.ready(this.renderMap)
        // console.log(firebase.auth().currentUser) // vraca trenutno ulogovanog usera u aplikaciji, i raznorazne podatke. Medjuim, kada rifresujemo stranicu, korisnik vise nije ulogovan, ovo printa null. To se desava jer kada rifresujemo sve unutar nase app se inicijalizuje ukljucujuci i firebase auth
        // setTimeout(() => { // medjutim ako ovako odlozimo za 3s od renderovanja mape i mounted() odrade, firebase se inicijalizuje. Medjutim, ovo je glupo resenje. Valjda u ovom moundet() lyfecycle hook firebase auth ne stize da se inicijalizuje, pa kao dajemo mu jos extra time
        //     console.log(firebase.auth().currentUser)
        // }, 3000) // on je stavio 2s ali kod mene je treba 3s, 2s mu nisu dovoljne . i sada rvo printa null, a nakon 3s printa korisnika. Idemo u main.js, tu nasa aplikacija prvo ulazi.

    }
}
</script>

<style>
.yandex-map {
    width: 100%;
    height: 90%;
    margin: 0 auto;
    background: #fff;
    position: absolute;
    /* top: 10%; */
    left: 0;
    z-index: -1;
    /* position: absolute;
    top: 20%; */
    /* height: 400px;
    width: 100%; */
}
</style>