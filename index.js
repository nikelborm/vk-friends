// @ts-check
'use strict';

import open from 'open';
import prompts from 'prompts';
import {
  ZodCacheSchema,
  ZodConfigSchema,
  readJsonFile,
  writeJsonFile,
  updateUserAccessTokenIn,
  canUserBePotentialFriend,
  fetchUnresolvedUsers,
  FriendsGraph,
} from './src/index.js';

let [ config, cache ] = await Promise.all([
  readJsonFile('./config.json', ZodConfigSchema),
  readJsonFile('./cache.json', ZodCacheSchema),
]);

const saveConfig = async () => await writeJsonFile('./config.json', config, ZodConfigSchema);
const saveCacheAndConfig = async () => await Promise.all([
  saveConfig(),
  writeJsonFile('./cache.json', cache, ZodCacheSchema),
]);

// if (!process.env.VK_SERVICE_KEY)
//   throw new Error('VK_SERVICE_KEY is not defined');
// const vkAccessToken = process.env.VK_SERVICE_KEY;
const vkAccessToken = await updateUserAccessTokenIn(config);

globalLoop: while(true) {
  const {
    userIdToUserMap,
    usersWithFriends,
  } = await fetchUnresolvedUsers(
    vkAccessToken,
    config.unresolvedNicknamesAndIdsOfPeopleToSearchFor
  );

  config.unresolvedNicknamesAndIdsOfPeopleToSearchFor = [];
  config.previouslyAskedToSearchForUserIds.push(
    ...usersWithFriends.map(({ userId }) => userId)
  );

  userIdToUserMap.fillWith(cache.resolvedFriendGraphNodes);

  const friendsGraph = new FriendsGraph();

  friendsGraph.addUsers(userIdToUserMap.getAllUsers());
  friendsGraph.addFriendShips(cache.resolvedFriendships);

  for (const { friendships } of usersWithFriends) {
    friendsGraph.addFriendShips(friendships());
  }


  // manually extracting edges from graphology graph is the best way to avoid duplicates in edge cache
  // manually extracting nodes from userIdToUserMap is the best way to avoid duplicates in node cache
  cache.resolvedFriendGraphNodes = [...userIdToUserMap.getAllUsers()];
  cache.resolvedFriendships = friendsGraph.getAllFriendships();
  await saveCacheAndConfig();


  // it is subset of [...all my friends(first handshake), ...friends of my friends(second handshake)]
  // it has people that are not in my friends list directly, but can potentially be friends with me (they share >=2 friend with me)
  // if we cannot access the person's profile (can_access_closed field), then he/she is not included in the list
  // if we previously added user to "not interested in" list, then he/she is not included in the list
  // if we previously asked to load user by adding to "unresolved people to search for" list, then he/she is not included in the list, because we already seen him/her
  const potentialFriends = friendsGraph.graph
    .mapNodes((_, user) => ({
      user,
      userId: user.id,
      friendsAmount: friendsGraph.getFriendsAmountOf(user.id),
      link: `https://vk.com/${user.screen_name}`,
    }))
    .filter(({ friendsAmount, user }) =>
      friendsAmount >= 2 &&
      canUserBePotentialFriend(user, config)
    )
    .sort((a, b) => b.friendsAmount - a.friendsAmount || b.userId - a.userId);

  console.log('Potential friends: ');
  console.table(potentialFriends, [
    'userId',
    'friendsAmount',
    'link'
  ]);

  for (let candidateIndex = 0; candidateIndex < potentialFriends.length; candidateIndex++) {
    const potentialFriend = potentialFriends[candidateIndex];

    console.log(`\nName: ${potentialFriend.user.first_name} ${potentialFriend.user.last_name}`);
    console.log(`Link: ${potentialFriend.link}`);
    console.log(`Friends: ${friendsGraph.getFriendsAmountOf(potentialFriend.userId)}`);
    await open(potentialFriend.link);
    const { answer } = await prompts({
      type: 'select',
      name: 'answer',
      message: 'Do you know this person? (Use arrow keys)',
      choices: [
        { title: 'Definitely yes', description: 'Graph will be expanded with their friends', value: 'yes' },
        { title: 'Definitely no', value: 'no' },
        { title: 'Skip current and update tree using candidates marked as known', value: 'reloadTree', disabled: !config.unresolvedNicknamesAndIdsOfPeopleToSearchFor.length },
        { title: 'Save progress and exit', value: 'exit' }
      ],
      initial: 1
    });

    if (answer === 'yes') {
      config.unresolvedNicknamesAndIdsOfPeopleToSearchFor.push(potentialFriend.userId);
      await saveConfig();
      continue globalLoop;
    } else if (answer === 'no') {
      config.notInterestedInUserIdsOrNicknames.push(potentialFriend.userId);
      await saveConfig();
    } else if (answer === 'exit') {
      break globalLoop;
    }
  }
}

await saveCacheAndConfig();
