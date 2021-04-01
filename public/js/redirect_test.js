var getParams = function (url) {
	var params = {};
	var parser = document.createElement('a');
	parser.href = url;
	var query = parser.search.substring(1);
	var vars = query.split('?').join(', ').split('&');
	for (var i = 0; i < vars.length; i++) {
		var pair = vars[i].split('=');
		params[pair[0]] = decodeURIComponent(pair[1]);
	}
	return params;
};

console.log(window.location.href);
console.log(window.location.search);

console.log(getParams("watch?v=_bDZNzMqf2M&list=PL259SQrrBF-JfV6-4nriDoH9x93URKhKA&index=17"));

function gotoroom(name){
    let newurl = '/room.html?key=' + name;
    window.location.href = newurl;
}

