// @ts-check
'use strict';

import { ZodVKUserSchema } from './zodSchemas.js';

/**
 * @param {import("vk-io").VK} vk - VK instance
 * @param {(number|string)[]} userIdsOrNicknames
 * @returns {Promise<import("./zodSchemas.js").VKUser[]>}
 */
export async function fetchUsers(vk, userIdsOrNicknames) {
  if (!userIdsOrNicknames.length)
    return [];

  // https://dev.vk.com/ru/method/users.get
  const response = await vk.api.users.get({
    user_ids: userIdsOrNicknames,
    name_case: 'nom',
    fields: ['screen_name'],
  });

  return ZodVKUserSchema.array().parse(response);
}
