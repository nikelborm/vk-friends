// @ts-check
'use strict';

/**
 * @typedef {import("./zodSchemas.js").VKUser} VKUser
 */

export class UserIdToUserMap {
  /**
  * @type {Map<number, VKUser>}
  */
  #map = new Map();

  /**
  * @param {VKUser[]} users
  */
  fillWith(users) {
    for (const user of users) {
      this.#map.set(user.id, user);
    }
  }

  /**
  * @param {number} userId
  * @param {VKUser} user
  */
  set(userId, user) {
    this.#map.set(userId, user);
  }

  /**
  * @param {number} userId
  */
  get(userId) {
    return this.#map.get(userId);
  }

  getAllUsers() {
    return this.#map.values();
  }

  getAllUserIds() {
    return this.#map.keys();
  }

  [Symbol.iterator]() {
    return this.#map[Symbol.iterator]();
  }
}
