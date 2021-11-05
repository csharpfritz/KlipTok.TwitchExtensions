var token = "";
var tuid = "";
var ebs = "";

if (twitch == null) twitch = { rig: console };

// because who wants to type this every time?
var twitch = window.Twitch.ext;

// create the request options for our Twitch API calls
var requests = {
    get: createRequest('GET', 'dashboard')
};

function createRequest(type, method) {

    return {
        type: type,
        url: 'https://localhost:8081/dashboard'
    }
}

function setAuth(token, helixToken) {
    Object.keys(requests).forEach((req) => {
        twitch.rig.log(`Setting auth headers with a token of length ${token.length} for ${req}`);
        requests[req].headers = { 
					'Authorization': 'Bearer ' + token, 
					'x-helix-access-token': helixToken 
				};
    });
}

twitch.onContext(function(context) {
    twitch.rig.log(context);
});

twitch.onAuthorized(async function(auth) {
    // save our credentials
    token = auth.token;
    tuid = auth.userId;

		twitch.rig.log("Twitch authenticated, calling localhost");

		var response = await fetch("https://localhost:8081/dashboard", {
			method: "GET",
			credentials: 'include',
			headers: {
				Fritz: "Is Frustrated"
			// 'Authorization': 'Bearer FOO' // + token,
				// 'x-helix-access-token': "BAR" //auth.token
			}
		});	
		var text = await response.text();
		twitch.rig.log(text);

		// var ajaxOptions = {
		// 	type: "GET",
		// 	url: 'https://localhost:8081/dashboard',
		// 	cache: false,
		// 	beforeSend: function (xhr) {
		// 		// xhr.setRequestHeader ("Authorization", "Bearer FOO");
		// 		// xhr.setRequestHeader ("x-helix-access-token", "FOO");
		// 	},
		// 	success: function(data) {
		// 		twitch.rig.log("Success");
		// 		twitch.rig.log(data);
		// 	},
		// 	error: function(data) {
		// 		twitch.rig.log("Error");
		// 		twitch.rig.log(data);
		// 	}
		// };

		// headers: {
		// 	// 'Authorization': 'Bearer ' + 'foo',
		// 	// 'x-helix-access-token': 'FOO' //auth.helixToken 
		// },

		$.ajax(ajaxOptions).done(function(data) {
			twitch.rig.log("Done");
			twitch.rig.log(data);	
		}).fail(function(data) {
			twitch.rig.log("Fail");
			twitch.rig.log(data);
		});

});

function updateBlock(foo) {
    twitch.rig.log('Updating block color');
//    $('#color').css('background-color', hex);
}

function logError(_, error, status) {
  twitch.rig.log('EBS request returned an error: '+status+' ('+error+')');
}

function logSuccess(hex, status) {
  // we could also use the output to update the block synchronously here,
  // but we want all views to get the same broadcast response at the same time.
  twitch.rig.log('EBS request returned '+hex+' ('+status+')');
}

$(function() {

    //   // listen for incoming broadcast message from our EBS
    // twitch.listen('broadcast', function (target, contentType, color) {
    //     twitch.rig.log('Received broadcast color');
    //     updateBlock(color);
    // });
});
