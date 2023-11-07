// @ts-check
'use strict';

import { z } from "zod";

export const ZodVKUserSchema = z.object({
  id: z.number(),
  screen_name: z.string(),
  first_name: z.string(),
  last_name: z.string(),
  can_access_closed: z.boolean(),
  is_closed: z.boolean(),
});

const UserIdsOrNicknamesSchema = z.union([z.string(), z.number()]).array();

export const ZodConfigSchema = z.object({
  userAccessToken: z.string().nullable(),
  notInterestedInUserIdsOrNicknames: UserIdsOrNicknamesSchema,
  previouslyAskedToSearchForUserIds: z.number().array(),
  unresolvedNicknamesAndIdsOfPeopleToSearchFor: UserIdsOrNicknamesSchema,
});

export const ZodCacheSchema = z.object({
  resolvedFriendGraphNodes: ZodVKUserSchema.array(),
  resolvedFriendships: z.tuple([z.number(), z.number()]).array(),
});

/**
* @typedef {z.infer<typeof ZodVKUserSchema>} VKUser
* @typedef {z.infer<typeof ZodConfigSchema>} Config
* @typedef {z.infer<typeof UserIdsOrNicknamesSchema>} UserIdsOrNicknames
*/
