// @ts-check
'use strict';

import { ZodVKUserSchema } from './zodSchemas.js';

/**
 * Fetches friends for a user and returns an object with user and friend details
 * @param {import("vk-io").VK} vk - instantiated VK instance
 * @param {number} userId - The user's ID
 * @returns {Promise<{userId: number, friends: import("./zodSchemas.js").VKUser[]}>} - A promise that resolves to an object containing user and friend details
 */
export async function fetchFriendsForUser(vk, userId) {
  // https://dev.vk.com/ru/method/friends.get
  const { items } = await vk.api.friends.get({
    user_id: userId,
    name_case: 'nom',
    fields: ['screen_name'],
  });
  return {
    userId,
    friends: ZodVKUserSchema.array().parse(items),
  };
}
