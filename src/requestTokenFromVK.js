// @ts-check
'use strict';

import open from 'open';

export async function requestTokenFromVK() {
  if (!process.env.VK_APP_ID)
    throw new Error('VK_APP_ID is not defined');

  const vkOAuthEndpoint = new URL('/authorize', 'https://oauth.vk.com');
  const { searchParams } = vkOAuthEndpoint;
  searchParams.set('client_id', process.env.VK_APP_ID);
  searchParams.set('display', 'page');
  // https://dev.vk.com/ru/reference/access-rights
  searchParams.set('scope', (65_536 /* offline */ + 2 /* friends */).toString());
  searchParams.set('response_type', 'token');
  searchParams.set('redirect_uri', 'http://localhost:3000/auth_callback');
  searchParams.set('v', '5.131');
  searchParams.set('state', Math.random().toString().slice(2));

  await open(vkOAuthEndpoint.toString());
}
