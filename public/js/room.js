let gauth = undefined;

let roomsref = undefined;
let mesref = undefined;
var db = null;
let auth = undefined;
let roomid = undefined;
let uid = undefined;

let createtime = 0;

let player = undefined;
let dbok = false;
let ytok = false;

//this is the startup function which starts all procedures
document.addEventListener('DOMContentLoaded', function () {
    console.log("startup...");
    roomid = window.location.search.replace('?key=', '');

    // This code loads the IFrame Player API code asynchronously.
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

    //if firebase project has not been initialized
    if (!firebase.apps.length) {
        var app = firebase.initializeApp(firebaseConfig);
    }

    auth = firebase.auth();
    gauth = new firebase.auth.GoogleAuthProvider();
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            uid = user.uid;
            photoURL = user.photoURL;
            console.log(uid);
        } else {
            console.log("no user, redirecting to login page...");
            window.location.href = '/login.html?key=' + roomid;
        }
    });


    db = firebase.database();

    roomsref = db.ref('rooms/' + roomid);
    mesref = db.ref('messages/' + roomid);
    roomsref.once('value', (result) => {
        //TODO: this code is uglyyyy, fix it with a common function that gets called for setting message handlers
        let room = result.val();
        if (!(result.val() !== null)) {
            console.log("room does not exist");
            const {
                uid,
                photoURL
            } = auth.currentUser;

            db.ref('rooms/' + roomid).set({
                name: roomid,
                createdAt: firebase.database.ServerValue.TIMESTAMP,
                uid: uid,
                photo: photoURL
            })

            db.ref('messages/' + roomid).push().set({
                uid: uid,
                sender: auth.currentUser.displayName,
                text: "room created!",
                createdAt: firebase.database.ServerValue.TIMESTAMP
            });

            roomsref.once('value', (roomresult) => {
                let lroom = roomresult.val();

                console.log("reading room");
                console.log(lroom.createdAt);
                console.log(new Date(lroom.createdAt));

                createtime = lroom.createdAt;
                dbok = true;
                console.log("create: " + createtime);
                onPlayerReady();

                mesref.on('child_added', (mresult) => {
                    console.log("reading messages")
                    console.log("new message");
                    let message = mresult.val();
                    console.log(message.text);
                    if (uid == message.uid) {
                        $("#messages").append(temp("dmessagestencil", {
                            key: mresult.key,
                            sender: message.sender,
                            text: message.text
                        }));
                    } else {
                        $("#messages").append(temp("fmessagestencil", {
                            key: mresult.key,
                            sender: message.sender,
                            text: message.text
                        }));
                    }
                });

                mesref.on('child_removed', (mresult => {
                    let room = mresult.val();
                    console.log('button[key="' + mresult.key + '"]');
                    $('div[key="' + mresult.key + '"]').remove();
                }));
            });

        } else {
            console.log("reading room");
            console.log(room.createdAt);
            console.log(new Date(room.createdAt));

            createtime = room.createdAt;
            dbok = true;
            console.log("create: " + createtime);
            onPlayerReady();

            mesref.on('child_added', (mresult) => {
                console.log("reading messages")
                console.log("new message");
                let message = mresult.val();
                console.log(message.text);
                if (uid == message.uid) {
                    $("#messages").append(temp("dmessagestencil", {
                        key: mresult.key,
                        sender: message.sender,
                        text: message.text
                    }));
                } else {
                    $("#messages").append(temp("fmessagestencil", {
                        key: mresult.key,
                        sender: message.sender,
                        text: message.text
                    }));
                }
            });

            mesref.on('child_removed', (mresult => {
                let room = mresult.val();
                console.log('button[key="' + mresult.key + '"]');
                $('div[key="' + mresult.key + '"]').remove();
            }));
        }
    });
});

function sendmessage(message) {
    mesref.push().set({
        uid: uid,
        sender: auth.currentUser.displayName,
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
            'onReady': function () {
                ytok = true;
                onPlayerReady();
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

function onPlayerReady(event) {
    if (ytok && dbok) {
        //TODO: better sync by waiting for a whole second after room creation
        synchronise();
    }
}

let playing = false;
let prevplaystate = false;
//TODO: better syncing by correcting every 60 seconds or so, requires testing
function onPlayerStateChange(event) {
    if (event === 0) {
        console.log("vid ended");
    }

    if (event.data == YT.PlayerState.PLAYING) {
        playing = true;
    } else if (event.data == YT.PlayerState.PAUSED) {
        playing = false;
    } else if (event.data == YT.PlayerState.ENDED) {
        console.log("restarting...");
        player.playVideo();
        synchronise();
    }

    if (playing == true && prevplaystate == false) {
        synchronise();
    }

    prevplaystate = playing;
}

function synchronise() {
    console.log("duration: " + player.getDuration());
    console.log("duration mils: " + player.getDuration() * 1000);
    let joindelta = new Date().getTime() - createtime;
    console.log("delta: " + joindelta);
    let seektime = joindelta % (player.getDuration() * 1000);
    seektime /= 1000;
    console.log("seek: " + seektime * 60);
    player.seekTo(seektime);
}

function login() {
    // using the object we will authenticate the user.
    firebase.auth().signInWithPopup(gauth);
}

function logout() {
    firebase.auth().signOut();
}