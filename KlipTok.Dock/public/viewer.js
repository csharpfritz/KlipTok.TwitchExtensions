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

		twitch.rig.log("Twitch authenticated, calling localhost for channel: " + auth.channelId);

		try {
		var response = await fetch("http://localhost:8081/dashboard", {
			method: "GET",
			credentials: 'same-origin',
			mode: 'cors',
			headers: {
			 'Authorization': 'Bearer ' + token
			}
		});	
		var text = await response.text();
		twitch.rig.log(text);
	} catch (e) 
	{
		twitch.rig.log(e);
	}

});