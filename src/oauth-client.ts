// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import * as http from 'http';
import { URL } from 'url';
const opn = require('opn');
const destroyer = require('server-destroy');

const { clientId, clientSecret } = require('../secrets/oauth.json');
const redirectUri = 'http://localhost:3000/oauth2callback';

class OAuthClient {
  oAuth2Client: OAuth2Client;

  constructor() {
    // create an oAuth client to authorize the API call
    this.oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
  }

  // Open an http server to accept the oauth callback. In this
  // simple example, the only request to our webserver is to
  // /oauth2callback?code=<code>
  async authenticate(scopes) {
    return new Promise((resolve, reject) => {
      // grab the url that will be used for authorization
      const authorizeUrl = this.oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes.join(' ')
      });
      const server = http
        .createServer(async (req, res) => {
          try {
            if (req.url.includes('/oauth2callback')) {
              const searchParams = new URL(req.url, redirectUri).searchParams;
              res.end('Authentication successful! Please return to the console.');
              server.destroy();
              const { tokens } = await this.oAuth2Client.getToken(searchParams.get('code'));
              this.oAuth2Client.credentials = tokens;
              resolve(this.oAuth2Client);
            }
          } catch (e) {
            reject(e);
          }
        })
        .listen(3000, () => {
          // open the browser to the authorize url to start the workflow
          opn(authorizeUrl, { wait: false }).then(cp => cp.unref());
        }) as http.Server & { destroy(): void };
      destroyer(server);
    });
  }
}

export default new OAuthClient();
