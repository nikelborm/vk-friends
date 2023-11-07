// @ts-check
'use strict';

/**
* @typedef {import("./zodSchemas.js").VKUser} VKUser
*/

import Graph from 'graphology';


export class FriendsGraph {
  /**
  * @type {Graph<VKUser>}
  */
  graph = new Graph({
    allowSelfLoops: false,
    multi: false,
    type: 'undirected',
  });

  /**
  * @param {Iterable<VKUser>} users
  */
  addUsers(users) {
    for (const user of users) {
      this.graph.addNode(user.id, user);
    }
  }

  /**
  * @param {Iterable<[number, number]>} friendships
  */
  addFriendShips(friendships) {
    for (const [firstFriendId, secondFriendId] of friendships) {
      this.graph.mergeEdge(firstFriendId, secondFriendId);
    }
  }

  /**
  * @param {number} userId
  */
  getFriendsAmountOf(userId) {
    return this.graph.degree(userId);
  }

  /**
  * @param {number} userId
  */
  getFriendsOf(userId) {
    return this.graph.neighbors(userId);
  }

  /**
  * @returns {[number, number][]}
  */
  getAllFriendships() {
    // @ts-ignore
    return this.graph.mapEdges((friendshipEdgeKey) => this.graph
      .extremities(friendshipEdgeKey)
      .map(userId => parseInt(userId, 10))
    );
  }
}
