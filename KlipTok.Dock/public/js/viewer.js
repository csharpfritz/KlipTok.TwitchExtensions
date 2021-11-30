var token = "";
var tuid = "";
var ebs = "https://localhost:8081";
// var ebs = "https://kliptok-api.azurewebsites.net";

// TODO: Cache data.. refresh daily?
var channelName = "";

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

				showPanel(href, pivot);
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

			channelName = (await response.json()).data[0].display_name;
			document.getElementById("logo").href = "https://kliptok.com/" + channelName;

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
			displayEmptyData(channelName);
			return;
		}

		if (response.status != 200) {
			displayEmptyData(channelName);
			return;
		}

		var response = await response.json();

		if (response.mostViewedClippers.length == 0){
			displayEmptyData(channelName);
			return;
		}

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
			legend: {
				visible: false
			},
			series: [{
				type: "radarColumn",
				name: "Day of Week",
				autoFit: true,
				color: "#FFF",
				data: response.clipsByDayOfWeek.map(x => x.count),
				tooltip: {
					visible: true
				},
			}],
			categoryAxis: {
				labels: {
					font: "8px Arial,Helvetica,sans-serif",
					color: "#FFF"
				},
				categories: [
						"Sunday", "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"
				],
				tooltip: {
					visible: false,
					format: "Total clips: {0}",
				}
			},
			valueAxis: {
				visible: false
			},
			chartArea: {
				background: "#5900db",
				margin: {
					top: 0
				},
				width: "290px",
				height: "290px"
			}
		});
		
});

function showPanel(href, pivot) {
	document.querySelectorAll(".panel").forEach(item => {
		if (!item.classList.contains("hidden")) {
			item.classList.add("hidden");
		}
	});

	var pivotItem = document.getElementById(href.substring(1));
	pivotItem.classList.remove("hidden");
	pivot.scrollTop = pivotItem.offsetTop;
}

function displayEmptyData(channelName)
{

	var link = document.getElementById("noclip_optin");
	link.href = "https://kliptok.com/" + channelName;

	showPanel("#panel_noclips", document.getElementById("pivot"));
	document.getElementById("pivot").classList.add("hidden");

}
