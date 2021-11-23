let token, userId;

const twitch = window.Twitch.ext;

twitch.onContext((context) => {
  twitch.rig.log(context);
	document.body.classList.value = context.theme;

});

twitch.onAuthorized(async function(auth) {
  token = auth.token;
  userId = auth.userId;

	var helixToken = auth.helixToken;

	if (helixToken != null) {

		var url = "https://api.twitch.tv/helix/users?id=" + auth.channelId;
		var response = await fetch(url, {
			headers: {
				"Client-ID": "eakutjhdwh3m1p7vd7uodnvweuhzmz",
				"Authorization": "Extension " + helixToken
			}
		});

		document.getElementById("kliptok_link").href = "https://kliptok.com/" + (await response.json()).data[0].display_name;

	}

});
