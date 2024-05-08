// @ts-check
'use strict';

import http from 'http';

// if you decide to change it, you have to update it here too:
// https://vk.com/editapp?id=${process.env.VK_APP_ID}&section=options
const port = Number(process.env.PORT) || 3000;

/**
 * @returns {Promise<string>}
 */
export async function receiveTokenFromVK() {
  return await new Promise((resolve, reject) => {
    let timeoutId;
    let server;

    const safeClose = () => {
      server.closeAllConnections();
      server.close();
      clearTimeout(timeoutId);
    }
    const rejectAndClose = (errMessage) => (reject(new Error(errMessage)), safeClose());
    const resolveAndClose = (token) => (resolve(token), safeClose());

    server = http.createServer((req, res) => {
      if (!req.url)
        return rejectAndClose('No URL in the request');

      const { pathname, searchParams } = new URL(req.url, `http://localhost:${port}/`);

      if (pathname === '/auth_callback') {
        return res.end(`
          <script type="text/javascript">
            window.location = 'http://localhost:${port}/pass_token_to_backend?' + window.location.hash.slice(1);
          </script>
        `);
      }

      if (pathname !== '/pass_token_to_backend')
        return res.end('Why are you here?');

      const access_token = searchParams.get('access_token')

      if (!access_token)
        return rejectAndClose('No access_token in the URL');

      res.end(`OK, you can close this tab now.`);

      resolveAndClose(access_token);
    });
    timeoutId = setTimeout(
      rejectAndClose.bind(null, 'Haven\'t received VK access token in 60 seconds'),
      60_000,
    )
    server.listen(port);
  })
}
