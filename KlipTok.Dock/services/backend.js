//import('node-fetch');

const Boom = require('boom');
const cors = require('cors');
const express = require('express');
const ext = require('commander');
const fetch = require('node-fetch');
const fs = require('fs');
const https = require('https');
const jsonwebtoken = require('jsonwebtoken');
const path = require('path');
const request = require('request');

require('dotenv').config();

// The developer rig uses self-signed certificates.  Node doesn't accept them
// by default.  Do not use this in production.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Use verbose logging during development.  Set this to false for production.
const verboseLogging = true;
const verboseLog = verboseLogging ? console.log.bind(console) : () => { };

// Service state variables
const bearerPrefix = 'Bearer ';             // HTTP authorization headers have this prefix
const channelCooldowns = {};                // rate limit compliance
let userCooldowns = {};                     // spam prevention

const STRINGS = {
  secretEnv: usingValue('secret'),
  clientIdEnv: usingValue('client-id'),
  ownerIdEnv: usingValue('owner-id'),
	portEnv: usingValue('port'),
  serverStarted: 'Server running at %s',
  secretMissing: missingValue('secret', 'EXT_SECRET'),
  clientIdMissing: missingValue('client ID', 'EXT_CLIENT_ID'),
  ownerIdMissing: missingValue('owner ID', 'EXT_OWNER_ID'),
  messageSendError: 'Error sending message to channel %s: %s',
  pubsubResponse: 'Message to c:%s returned %s',
  cooldown: 'Please wait before clicking again',
  invalidAuthHeader: 'Invalid authorization header',
  invalidJwt: 'Invalid JWT',
};

const userCooldownMs = 1000;                // maximum input rate per user to prevent bot abuse
const userCooldownClearIntervalMs = 60000;  // interval to reset our tracking object

ext.
  version(require('../package.json').version).
  option('-s, --secret <secret>', 'Extension secret').
  option('-c, --client-id <client_id>', 'Extension client ID').
  option('-o, --owner-id <owner_id>', 'Extension owner ID').
  option('-p, --port <port>', 'Network port', 8081).
  parse(process.argv);

const ownerId = getOption('ownerId', 'EXT_OWNER_ID');
const secret = Buffer.from(getOption('secret', 'EXT_SECRET'), 'base64');
const clientId = getOption('clientId', 'EXT_CLIENT_ID');
const port = getOption('port', 'EXT_PORT');


const serverOptions = {
};
const serverPathRoot = path.resolve(__dirname, '..', 'conf', 'server');
if (fs.existsSync(serverPathRoot + '.crt') && fs.existsSync(serverPathRoot + '.key')) {
    serverOptions.cert = fs.readFileSync(serverPathRoot + '.crt');
    serverOptions.key = fs.readFileSync(serverPathRoot + '.key');
}

var app = express();
app.use(cors({ origin: true }));
app.get('/dashboard', loadChannelData);

var server = https.createServer(serverOptions, app);

// Start the server.
server.listen(port);
console.log(STRINGS.serverStarted, server.address().port);

function usingValue(name) {
  return `Using environment variable for ${name}`;
}

function missingValue(name, variable) {
  const option = name.charAt(0);
  return `Extension ${name} required.\nUse argument "-${option} <${name}>" or environment variable "${variable}".`;
}

// Get options from the command line or the environment.
function getOption(optionName, environmentName) {
  const option = (() => {
    if (ext[optionName]) {
      return ext[optionName];
    } else if (process.env[environmentName]) {
      console.log(STRINGS[optionName + 'Env']);
      return process.env[environmentName];
    }
    console.log(STRINGS[optionName + 'Missing']);
    process.exit(1);
  })();
  // console.log(`Using "${option}" for ${optionName}`);
  return option;
}

// Verify the header and the enclosed JWT.
function verifyAndDecode(header) {
  if (header && header.startsWith(bearerPrefix)) {
    try {
      const token = header.substring(bearerPrefix.length);
      return jsonwebtoken.verify(token, secret, { algorithms: ['HS256'] });
    }
    catch (ex) {
      throw Boom.unauthorized(STRINGS.invalidJwt);
    }
  }
  throw Boom.unauthorized(STRINGS.invalidAuthHeader);
}

async function loadChannelData(req, res) {

	console.log("Loading channel data");
  // console.log(req.headers);

  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);

  // Get the streamer dashboard data  from KlipTok
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;
	const channelResponse = await fetch(`https://kliptok.com/api/GetStreamerDashboardByChannelId/${channelId}`);

	res.status(200).send((await channelResponse.json()).mostViewedClippers).end();

}