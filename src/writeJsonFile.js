// @ts-check
'use strict';

import { writeFile } from 'fs/promises';

/**
 * @template {import("zod").ZodTypeAny} T
 * @param {string} path
 * @param {import("zod").z.infer<T>} value
 * @param {T} schema
 * @returns {Promise<void>}
 */
export async function writeJsonFile(path, value, schema) {
  schema.parse(value);

  await writeFile(
    path,
    JSON.stringify(value, null, 2),
    { encoding: 'utf-8' },
  );
}
