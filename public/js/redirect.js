var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('?');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

if(getParams(window.location.href).v != undefined){
    gotoroom(getParams(window.location.href).v);
} else if(window.location.pathname != '/' && window.location.pathname != ''){
    gotoroom(window.location.pathname.replace('/', ''));
}

function gotoroom(name){
    let newurl = '/room.html?key=' + name;
    window.location.href = newurl;
}

