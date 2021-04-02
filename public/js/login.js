document.addEventListener('DOMContentLoaded', function () {
    console.log("startup...");

    const firebaseConfig = {
        apiKey: "AIzaSyC6Cq8c5jprpZYin5iB_KSAdatFbRPicfk",
        authDomain: "ytbeam.firebaseapp.com",
        databaseURL: "https://ytbeam-default-rtdb.firebaseio.com",
        projectId: "ytbeam",
        storageBucket: "ytbeam.appspot.com",
        messagingSenderId: "161790539788",
        appId: "1:161790539788:web:c7277bb637e4a5dda39629"
    };

    if (!firebase.apps.length) {
        var app = firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();

    gauth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            console.log(uid);

            let newurl = "";
            if (window.location.search.includes("?key")) {
                newurl = "/room.html" + window.location.search;
                window.location.href = newurl;
            } else {
                newurl = "";
                window.location.replace(window.location.protocol + '//' + window.location.hostname + ':' + location.port);
            }


        } else {
            console.log("no user, this is expected");
        }
    });

});

function login() {
    // using the object we will authenticate the user.
    firebase.auth().signInWithPopup(gauth);
}

function anonlogin() {
    firebase.auth().signInAnonymously()
        .then(() => {
            console.log("ez login");
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log("anon login error");
        });
}

function logout() {
    firebase.auth().signOut();
}