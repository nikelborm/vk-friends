// @ts-check
'use strict';

import { readFile } from 'fs/promises';

/**
 * @template {import("zod").ZodTypeAny} T
 * @param {string} path
 * @param {T} schema
 * @returns {Promise<import("zod").z.infer<T>>}
 */
export async function readJsonFile(path, schema) {
  return schema.parse(JSON.parse(await readFile(path, { encoding: 'utf-8' })))
}
