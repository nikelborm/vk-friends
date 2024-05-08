// @ts-check
'use strict';

import { VK } from 'vk-io';
import { UserIdToUserMap } from './userIdToUserMap.js';
import { fetchUsers } from './fetchUsers.js';
import { fetchFriendsForUser } from './fetchFriendsForUser.js';

/**
 *
 * @param {string} vkAccessToken
 * @param {import('./zodSchemas.js').UserIdsOrNicknames} unresolvedNicknamesAndIdsOfPeopleToSearchFor
 */
export async function fetchUnresolvedUsers(
  vkAccessToken,
  unresolvedNicknamesAndIdsOfPeopleToSearchFor,
) {
  const vk = new VK({
    token: vkAccessToken,
    language: 'ru',
  });

  const userIdToUserMap = new UserIdToUserMap();

  console.time('users');
  const users = await fetchUsers(vk, unresolvedNicknamesAndIdsOfPeopleToSearchFor);
  userIdToUserMap.fillWith(users);
  console.timeEnd('users');

  console.time('usersWithFriends');
  const usersWithFriends = await Promise.all(
    users.map(async ({ id }) => {
      const { userId, friends } = await fetchFriendsForUser(vk, id);
      userIdToUserMap.fillWith(friends);
      return {
        userId,
        friends,
        /**
         * @returns {Generator<[number, number]>}
         */
        *friendships() {
          for (const { id } of friends) {
            yield [userId, id];
          }
        }
      };
    })
  );
  console.timeEnd('usersWithFriends');

  return {
    usersWithFriends,
    userIdToUserMap,
  };
}
