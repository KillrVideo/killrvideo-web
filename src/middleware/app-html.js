import { readFileSync } from 'fs';
import config from 'config';

// Read the file once on startup and replace the client config token with the actual client
// config from the server
let html = readFileSync(`${__dirname}/../resources/static/server.html`, 'utf8');
html = html.replace('CLIENT_CONFIG_VALUE_GOES_HERE', JSON.stringify(config.get('client')));

/**
 * Returns a middleware function that will send the HTML for the application.
 */
export function appHtml() {
  return function renderAppHtml(req, res) {
    res.send(html);
  };
};