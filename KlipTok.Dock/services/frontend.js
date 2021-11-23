const express = require('express');
const app = express();

let client_id = 'eakutjhdwh3m1p7vd7uodnvweuhzmz';
let ebs_domain = '589f-98-115-65-55.ngrok.io';
let public_folder = "/../public/";
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

/*
Current base CSP rules subject to change

See:
https://discuss.dev.twitch.tv/t/new-extensions-policy-for-content-security-policy-csp-directives-and-timeline-for-enforcement/33695/2

This example is based off a live extension
*/
let contentSecurityPolicy = {
    directives: {
        defaultSrc: [
            "'self'",
            `https://${client_id}.ext-twitch.tv`
        ],
        connectSrc: [
            "'self'",
            `https://${client_id}.ext-twitch.tv`,
            'https://extension-files.twitch.tv',
            'https://www.google-analytics.com',
            'https://stats.g.doubleclick.net'
        ],
        fontSrc:    [
            "'self'",
            `https://${client_id}.ext-twitch.tv`,
            'https://fonts.googleapis.com',
            'https://fonts.gstatic.com'
        ],
        imgSrc:     [
            "'self'",
            'data:',
            'blob:',
						'https://static-cdn.jtvnw.net'
        ],
        mediaSrc:   [
            "'self'",
            'data:',
            'blob:'
        ],
        scriptSrc:  [
            "'self'",
            `https://${client_id}.ext-twitch.tv`,
            'https://extension-files.twitch.tv',
            'https://www.google-analytics.com',
            'https://stats.g.doubleclick.net'
        ],
        styleSrc:   [
            "'self'",
            "'unsafe-inline'",
            `https://${client_id}.ext-twitch.tv`,
            'https://fonts.googleapis.com'
        ],

        frameAncestors: [
            'https://supervisor.ext-twitch.tv',
            'https://extension-files.twitch.tv',
            'https://*.twitch.tv',
            'https://*.twitch.tech',
            'https://localhost.twitch.tv:*',
            'https://localhost.twitch.tech:*',
            'http://localhost.rig.twitch.tv:*'
        ]
    }
}

/*
should we enable the Rig?

The rig being an electron app, will call some other things
As well as having a file:// based parent
*/
console.log('Appending Rig CSP');
let rig_sources = {
    connectSrc: [
        'wss://pubsub-edge.twitch.tv'
    ],
    frameAncestors: [
        'http://localhost:*',
        'file://*',
        'filesystem:'
    ]
}

// append these to the CSP
for (let sourceType in rig_sources) {
    for (let x=0;x<rig_sources[sourceType].length;x++) {
        contentSecurityPolicy.directives[sourceType].push(rig_sources[sourceType][x]);
    }
}
/*
Did we configure an EBS to call
*/
console.log('Appending EBS Domain');
let ebs_rules = {
		imgSrc: [
				'https://' + ebs_domain,
		],
		mediaSrc: [
				'https://' + ebs_domain,
		],
		connectSrc: [
				'https://' + ebs_domain,
		]
}

for (let sourceType in ebs_rules) {
		for (let x=0;x<ebs_rules[sourceType].length;x++) {
				contentSecurityPolicy.directives[sourceType].push(ebs_rules[sourceType][x]);
		}
}

const helmet = require('helmet');
/*
You can use Security Headers to test your server, if this server is web accessible
https://securityheaders.com/
It'll test that your CSP is valid.
Best testing done with an extension, on Twitch or in the rig!
*/

console.log('Going to use the following CSP', contentSecurityPolicy);

app.use(helmet({
    contentSecurityPolicy
}));

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
app.use('/', express.static(__dirname + public_folder));
