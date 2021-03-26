if(window.location.pathname != '/' && window.location.pathname != ''){
    gotoroom(window.location.pathname.replace('/', ''));
}

function gotoroom(name){
    let newurl = '/room.html?key=' + name;
    window.location.href = newurl;
}