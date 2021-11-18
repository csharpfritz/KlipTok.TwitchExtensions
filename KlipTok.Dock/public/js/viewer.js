var token = "";
var tuid = "";
var ebs = "";

if (twitch == null) twitch = { rig: console };

// because who wants to type this every time?
var twitch = window.Twitch.ext;

twitch.onAuthorized(async function(auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;
		var helixToken = auth.helixToken;

		if (helixToken != null) {

			var url = "https://api.twitch.tv/helix/users?id=" + auth.channelId;
			var response = await fetch(url, {
				headers: {
					"Client-ID": "eakutjhdwh3m1p7vd7uodnvweuhzmz",
					"Authorization": "Extension " + helixToken
				}
			});

			document.getElementById("logo").href = "https://kliptok.com/" + (await response.json()).data[0].display_name;

		}


		twitch.rig.log("Twitch authenticated, calling localhost for channel: " + auth.channelId);

		try {
		var response = await fetch("https://localhost:8081/dashboard", {
			method: "GET",
			credentials: 'same-origin',
			mode: 'cors',
			headers: {
			 'Authorization': 'Bearer ' + token
			}
		});	
		var clippers = await response.json();
		clippers = clippers.map(c => ({
			...c, url: c.url || "icon.png"
		}));

		var template = "{{#.}}" +
			"<li><img src='{{ url }}' /> <span>{{ name }}</span> {{ count }}</li>" +
		"{{/.}}";
		var rendered = Mustache.render(template, clippers);
		document.getElementById('mostViewedClippers').innerHTML = rendered;

	} catch (e) 
	{
		twitch.rig.log(e);
	}

});