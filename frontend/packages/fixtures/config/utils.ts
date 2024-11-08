import fs from 'fs';
import path from 'path';
import { runBiome } from '@onefootprint/request-types/config/run-biome';
import _, { camelCase } from 'lodash';

const excludePrefixes: string[] = ['bank.', 'document.', 'id.', 'card.', 'investor_profile.', 'custom.', 'business.'];

export function toCamelCase(obj: unknown): unknown {
  if (_.isArray(obj)) {
    return obj.map(item => toCamelCase(item));
  }
  if (_.isObject(obj) && obj !== null) {
    return _(obj)
      .mapKeys((_, key) => {
        const shouldExclude = excludePrefixes.some(prefix => key.startsWith(prefix));
        return shouldExclude ? key : camelCase(key); // Only camelCase if none of the prefixes match
      })
      .mapValues(value => toCamelCase(value)) // Recursively apply to nested objects
      .value();
  }
  return obj;
}

export function sortObjectKeys(obj: unknown): unknown {
  if (_.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (_.isObject(obj)) {
    return _(obj)
      .toPairs() // Convert to array of [key, value] pairs
      .sortBy(0) // Sort by the key (0 index of each pair)
      .fromPairs() // Convert back to an object
      .mapValues(sortObjectKeys) // Recursively apply sorting to nested objects
      .value();
  }
  return obj;
}

export const createDictionaryFile = (newPersistedValues: string) => {
  const filePath = path.resolve('config/persisted-values.ts');

  fs.writeFileSync(filePath, newPersistedValues);

  runBiome(filePath);
};
