let gauth = undefined;

let roomsref = undefined;
let mesref = undefined;
var db = null;
let auth = undefined;

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

    db = firebase.database();
    roomsref = db.ref('rooms');
    mesref = db.ref('messages');
    auth = firebase.auth();

    gauth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            console.log(uid);
        } else {
            console.log("no user");
        }
    });

    roomsref.off();

    roomsref.on('child_added', (result) => {
        let room = result.val();
        $("#rooms").append(temp("roomstencil", {
            key: result.key,
            name: room.name
        }));
    });

    roomsref.on('child_removed', (result => {
        let room = result.val();
        console.log('button[key="' + result.key + '"]');
        $('button[key="' + result.key + '"]').remove();
    }));

});

async function newroom(name) {
    const {
        uid,
        photoURL
    } = auth.currentUser;

    roomsref.push().set({
        name: name,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        uid: uid,
        photo: photoURL
    })

    db.ref('messages/' + name).push().set({
        message: "room created!",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}

if(window.location.pathname != '/' && window.location.pathname != ''){
    gotoroom(window.location.pathname);
}

function gotoroom(name){
    let newurl = window.location.protocol + '//' + window.location.hostname + ':' + location.port + '/room.html?key=' + name;
    window.location.href = newurl;
}

function login() {
    // using the object we will authenticate the user.
    firebase.auth().signInWithPopup(gauth);
}

function logout() {
    firebase.auth().signOut();
}

// Get the input field
var input = document.getElementById("roomnamei");

// Execute a function when the user releases a key on the keyboard
input.addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        console.log("new room!");
        console.log(document.getElementById("roomnamei").value);
        newroom(document.getElementById("roomnamei").value);
        document.getElementById("roomnamei").value = "";
    }
});