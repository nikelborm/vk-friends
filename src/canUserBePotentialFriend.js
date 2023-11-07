// @ts-check
'use strict';

/**
 * @param {import("./zodSchemas.js").VKUser} user
 * @param {import("./zodSchemas.js").Config} config
 * @returns {boolean}
 */
export const canUserBePotentialFriend = (user, config) =>
  !config.previouslyAskedToSearchForUserIds.includes(user.id) &&
  !config.notInterestedInUserIdsOrNicknames.includes(user.id) &&
  !config.notInterestedInUserIdsOrNicknames.includes(user.screen_name) &&
  user.can_access_closed &&
  !(
    user.first_name === 'DELETED' &&
    user.last_name === ''
  );
