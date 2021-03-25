let gauth = undefined;

let roomsref = undefined;
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

    db = firebase.firestore(app);
    roomsref = db.collection("rooms");
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



    readdata();



});

async function readdata() {
    const snapshot = await roomsref.get();
    snapshot.docs.map(doc => {
        console.log(doc.data());
        console.log(doc.data().uid);
        $("#rooms").append(temp("roomstencil", {
            id: doc.id,
            name: doc.data().name
        }));

    });
}

async function newroom(name) {
    const { uid, photoURL } = auth.currentUser;

    await roomsref.doc(name).set({
        name: name,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: uid,
        photo: photoURL
    });

    await roomsref.doc(name).collection('messages').doc('createmessage').set({
        Text: "Room created",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        uid: '0'
    });
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