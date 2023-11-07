// @ts-check
'use strict';

import { receiveTokenFromVK } from './receiveTokenFromVK.js';
import { requestTokenFromVK } from './requestTokenFromVK.js';

/**
 * @param {import("zod").z.infer<typeof import("./zodSchemas.js").ZodConfigSchema>} config
 */
export async function updateUserAccessTokenIn(config) {
  if (config.userAccessToken)
    return config.userAccessToken;

  const [token] = await Promise.all([
    receiveTokenFromVK(),
    requestTokenFromVK(),
  ]);

  config.userAccessToken = token;

  return token;
}
