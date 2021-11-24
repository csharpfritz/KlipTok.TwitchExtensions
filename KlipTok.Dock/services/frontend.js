const express = require('express');
const app = express();

let client_id = 'eakutjhdwh3m1p7vd7uodnvweuhzmz';
let ebs_domain = 'http://localhost:8081';
let public_folder = __dirname + "/../public/";
let port = 8080;

/*
Setup Express to Listen on a Port
*/
app.listen(port, function () {
    console.log('booted express on', port);
})

/*
CSP
*/
const twitchextensioncsp = require('twitchextensioncsp');
app.use(twitchextensioncsp({
    clientID: client_id,
    enableRig: true,
    imgSrc: [
        'https://static-cdn.jtvnw.net'
    ],
    connectSrc: [
        ebs_domain
    ]
});

/*
Setup a "Log" Event for file loading.
So you can see what is trying to be loaded
*/
app.use(function(req, res, next) {
    console.log('received from', req.get('X-Forwarded-For'), ':', req.method, req.originalUrl);
    next();
});
/*
Setup express Static to server those files
*/
app.use('/', express.static(public_folder));
