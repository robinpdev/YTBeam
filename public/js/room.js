let gauth = undefined;

let roomsref = undefined;
let mesref = undefined;
var db = null;
let auth = undefined;
let roomid = undefined;
let uid = undefined;

let createtime = 0;

let player = undefined;

document.addEventListener('DOMContentLoaded', function () {
    console.log("startup...");
    roomid = window.location.search.replace('?key=', '');

    // 2. This code loads the IFrame Player API code asynchronously.
    var tag = document.createElement('script');

    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

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

    roomsref = db.ref('rooms/' + roomid);
    roomsref.on('value', (result) => {
        let room = result.val();
        console.log(room.createdAt);
        console.log(new Date(room.createdAt));

        createtime= new Date().getTime();
        console.log(createtime);
    });

    mesref = db.ref('messages/' + roomid);
    auth = firebase.auth();

    gauth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            uid = user.uid;
            photoURL = user.photoURL;
            console.log(uid);
        } else {
            console.log("no user");
        }
    });

    mesref.on('child_added', (result) => {
        console.log("new message");
        let message = result.val();
        console.log(message.text);
        if (uid == message.uid) {
            $("#messages").append(temp("dmessagestencil", {
                key: result.key,
                text: message.text
            }));
        } else {
            $("#messages").append(temp("fmessagestencil", {
                key: result.key,
                text: message.text
            }));
        }
    });

    mesref.on('child_removed', (result => {
        let room = result.val();
        console.log('button[key="' + result.key + '"]');
        $('div[key="' + result.key + '"]').remove();
    }));

});

function sendmessage(message) {
    mesref.push().set({
        uid: uid,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        text: message,
        photo: photoURL
    });
}

var messagei = document.getElementById("messagei");
document.getElementById("messagei").addEventListener("keyup", function (event) {
    // Number 13 is the "Enter" key on the keyboard
    if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        console.log(messagei.value);
        sendmessage(messagei.value);
        messagei.value = "";
    }
});

function onYouTubeIframeAPIReady() {
    player = new YT.Player('player', {
        height: "100%",
        width: "100%",
        videoId: roomid, // commonroom: n9JCPzNKm7Q  synctest: ucZl6vQ_8Uo   triggers: H0T6a5KKnd4
        events: {
            'onReady': onPlayerReady,
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(){
    if(createtime != undefined){
        player.playVideo();
        console.log("duration: " + player.getDuration());
        console.log("duration mils: " + player.getDuration() * 1000);
        let joindelta = new Date().getTime() - createtime;
        console.log("delta: " + joindelta / 1000);
        let seektime = joindelta % (player.getDuration() * 1000);
        seektime /= 1000;
        console.log("seek: " + seektime * 60);
        player.seekTo(seektime);
    }
}

function onPlayerStateChange(){

}

function login() {
    // using the object we will authenticate the user.
    firebase.auth().signInWithPopup(gauth);
}

function logout() {
    firebase.auth().signOut();
}