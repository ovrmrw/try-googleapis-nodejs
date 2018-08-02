import { google } from 'googleapis';
import client from './oauth-client';

const urlshortener = google.urlshortener({
  version: 'v1',
  auth: client.oAuth2Client
});

async function main() {
  await client.authenticate(['https://www.googleapis.com/auth/urlshortener']);
  urlshortener.url.get(
    {
      shortUrl: 'http://goo.gl/DdUKX'
    },
    (err, res) => {
      if (err) {
        throw err;
      }
      console.log(res.data);
    }
  );
}

main().catch(console.error);
