import { clearUserData, errorHandler, extendPartial, getUserData, saveUserData } from "./util.js";

var db = firebase.firestore();
const userAuth = firebase.auth();

const app = Sammy('#root', function () {

    this.use('Handlebars', 'hbs')
    //home routes
    this.get('#/userDestination', function (context) {
        db.collection("destination")
            .get()
            .then((response) => {
                let destinations = response.docs.map((dist) => { return { id: dist.id, ...dist.data() } })
                let uid = getUserData().uid
                let myDestin = (destinations.filter((x) => uid == x.creator))
                context.destination = myDestin
                console.log(context.destination);
                extendPartial(context)
                    .then(function () {
                        this.partial('/templates/userDestination.hbs')
                    })
            })
            .catch(errorHandler);
    })
    this.get('#/home', function (context) {
        db.collection("destination")
            .get()
            .then((response) => {
                context.destination = response.docs.map((dist) => { return { id: dist.id, ...dist.data() } })
                console.log(context.destination)
                extendPartial(context)
                    .then(function () {
                        this.partial('/templates/homeGuest.hbs')
                    })
            })
            .catch(errorHandler);



    })
    //routes User
    this.get('#/register', function (context) {
        extendPartial(context)
            .then(function () {
                this.partial('/templates/register.hbs')
            })

    })
    this.post('#/register', function (context) {
        let { email, password, rePassword } = context.params;
        if (password !== rePassword) {
            return
        };

        userAuth.createUserWithEmailAndPassword(email, password)
            .then((user) => {
                console.log('You are registered !!');
                this.redirect('#/login')
            })
            .catch(errorHandler)
    })


    this.get('#/login', function (context) {
        extendPartial(context)
            .then(function () {
                this.partial('/templates/login.hbs')
            })
    })
    this.post('#/login', function (context) {
        let { email, password } = context.params;
        userAuth.signInWithEmailAndPassword(email, password)
            .then((userData) => {
                console.log('Login successful');
                saveUserData(userData)
                this.redirect('#/home')
            })
            .catch(errorHandler)
    })

    this.get('#/logout', function (context) {
        userAuth.signOut().then(function () {
            clearUserData()
            console.log('Logout successful.');
            context.redirect('#/home')
        }).catch(errorHandler)
    })

    this.get('#/details/:id', function (context) {

        db.collection("destination")
            .doc(context.params.id)
            .get()
            .then((response) => {

                let actualData = response.data()
                console.log(actualData);
                let userId = getUserData().uid
                let imCreator = actualData.creator == userId

                context.destinations = { ...actualData, id: context.params.id, imCreator }
                extendPartial(context)
                    .then(function () {
                        this.partial('/templates/details.hbs')
                    })
            })



    })


    this.get('#/edit/:id', function (context) {
        db.collection('destination')
            .doc(context.params.id)
            .get()
            .then(function (response) {
                let destinData = response.data()
                context.destinations = { ...destinData, id: context.params.id }
                extendPartial(context)
                    .then(function () {
                        this.partial('/templates/edit.hbs')
                    })

            }).catch(errorHandler)


    })
    this.post('#/edit/:id', function (context) {

        let { id, destination, imgUrl, duration, departureDate, city } = context.params

        db.collection("destination")
            .doc(id)
            .update({
                destination,
                imgUrl,
                duration,
                departureDate,
                city,

            }).then(function () {
                console.log("Document successfully updated!");
                context.redirect(`#/details/${id}`)
            })
            .catch(errorHandler)


    })

    this.get('#/delete/:id', function (context) {
        db.collection('destination')
            .doc(context.params.id)
            .delete()
            .then(function () {

                context.redirect('#/userDestination')
            }).catch(errorHandler)
    })

    this.get('#/create', function (context) {
        extendPartial(context)
            .then(function () {
                this.partial('/templates/create.hbs')
            })

    })
    this.post('#/create', function (context) {
        let { destination, city, duration, departureDate, imgUrl } = context.params;
        console.log(context.params);
        db.collection('destination').add({
            destination,
            city,
            duration,
            departureDate,
            imgUrl,
            creator: getUserData().uid,
            //client: []
        })
            .then(function (docRef) {

                context.redirect('#/home')
            })
            .catch(errorHandler)

    })
})

app.run('#/home')