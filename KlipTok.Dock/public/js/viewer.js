var token = "";
var tuid = "";
//var ebs = "https://localhost:8081";
var ebs = "https://kliptok-api.azurewebsites.net";

// TODO: Cache data.. refresh daily?

if (twitch == null) twitch = { rig: console };

// because who wants to type this every time?
var twitch = window.Twitch.ext;

document.querySelectorAll("#pivot a").forEach(item => item.addEventListener("click", function (e) {
		var href = e.target.getAttribute("href");
		if (href.startsWith("#")) {
				e.preventDefault();
				var pivot = document.querySelector("#pivot");
				var pivotItems = document.querySelectorAll("#pivot a");
				for (var i = 0; i < pivotItems.length; i++) {
						if (pivotItems[i].classList.contains("active")) {
								pivotItems[i].classList.remove("active");
						}
				}

				e.target.classList.add("active");

				document.querySelectorAll(".panel").forEach(item => {
					if (!item.classList.contains("hidden") ) {
						item.classList.add("hidden");
					}
				})

				var pivotItem = document.getElementById(href.substring(1));
				pivotItem.classList.remove("hidden");
				pivot.scrollTop = pivotItem.offsetTop;
		}
}));

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

			var response = await fetch(ebs + "/dashboardAll", {
				method: "GET",
				// credentials: 'include',
				// mode: 'no-cors',
				headers: {
				'Authorization': 'Bearer ' + token
				}
			});	
		
		} catch (e) 
		{
			twitch.rig.log(e);
		}

		var response = await response.json();
		var clippers = response.mostViewedClippers;
		clippers = clippers.map(c => ({
			...c, url: c.url || "icon.png"
		}));

		var template = "{{#.}}" +
			"<li><img src='{{ url }}' /> <span>{{ name }}</span> {{ count }}</li>" +
		"{{/.}}";
		var rendered = Mustache.render(template, clippers);
		document.getElementById('mostViewedClippers').innerHTML = rendered;

		// Build the day of week chart with kendo
		$("#panel_clipsbydayofweek").kendoChart({
			title: {
				text: "Clips by Day of Week"
			},
			legend: {
				visible: false
			},
			series: [{
				type: "radarColumn",
				name: "Day of Week",
				autoFit: true,
				color: "#5900db",
				data: response.clipsByDayOfWeek.map(x => x.count)
			}],
			categoryAxis: {
				categories: [
						"Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
				]
			},
			valueAxis: {
				visible: false
			},
			chartArea: {
				width: "290px"
			}
		});
		
});
