import fs from 'fs';
import path from 'path';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { runBiome } from '@onefootprint/request-types/config/run-biome';
import deepmerge from 'deepmerge';
import { JSONSchemaFaker } from 'json-schema-faker';
import _ from 'lodash';
import type { OpenAPIV3 } from 'openapi-types';
import { augmentForFaker } from './augment-for-faker';
import * as persistedValues from './persisted-values';
import { createDictionaryFile, sortObjectKeys, toCamelCase } from './utils';

JSONSchemaFaker.option({
  minItems: 3,
  maxItems: 3,
  fillProperties: false,
  // TODO: eventually would be nice to reuse the `example` for each field. The backend does provide an example for some
  useDefaultValue: true,
  // Needed to generate stable results
  alwaysFakeOptionals: true,
});

const dictionary: Record<string, unknown> = {};
let newPersistedValuesImports = '';
let newPersistedValues = '';

// NOTE: there is one flaw in fixture generation: removing a field from the open API spec will not remove it
// from the generated fixtures.
// To do so, we have to get rid of the `persisted-values.ts` file. We should make schema generation a function
// only of the open API spec, but also try to make produced values stable for the same keys.
// We could either remove randomization, or make randomization purely a function of the object's key.
export async function generateFixtures(type: 'hosted' | 'dashboard') {
  let examples = '';
  let imports = 'import deepmerge from "deepmerge";\nimport type { \n';

  const config =
    type === 'hosted'
      ? {
          import: '@onefootprint/request-types',
          outputPath: path.resolve('./index.ts'),
          specPath: path.resolve('../../apps/docs/src/pages/api-reference/assets/hosted-api-docs.json'),
        }
      : {
          import: '@onefootprint/request-types/dashboard',
          outputPath: path.resolve('./dashboard.ts'),
          specPath: path.resolve('../../apps/docs/src/pages/api-reference/assets/dashboard-api-docs.json'),
        };

  const spec = (await $RefParser.dereference(config.specPath)) as OpenAPIV3.Document;

  if (spec.components?.schemas) {
    const enhancedSchemas = Object.entries(spec.components.schemas).reduce(
      (acc, [name, schema]) => {
        acc[name] = augmentForFaker(schema as OpenAPIV3.SchemaObject);
        return acc;
      },
      {} as Record<string, OpenAPIV3.SchemaObject>,
    );

    for (const [name, schema] of Object.entries(enhancedSchemas)) {
      imports += `${name},\n`;
      const example = await JSONSchemaFaker.resolve(schema, enhancedSchemas);

      const index = `${type}_${name}`;

      const persistedValue = persistedValues[index as keyof typeof persistedValues];

      dictionary[index] = persistedValue
        ? _.isObject(persistedValue)
          ? deepmerge(example as Record<string, unknown>, persistedValue as Record<string, unknown>, {
              arrayMerge: (_, sourceArray) => sourceArray,
            })
          : persistedValue
        : example;

      const mocks = _.isObject(dictionary[index]) ? sortObjectKeys(toCamelCase(dictionary[index])) : dictionary[index];

      if (_.isObject(dictionary[index])) {
        examples += `
        export const get${name[0].toUpperCase() + name.slice(1)} = (props: Partial<${name}>, options: { overwriteArray: boolean} = { overwriteArray: true }): ${name} => 
        deepmerge<${name}>(${JSON.stringify(mocks, null, 2)}, props, {...(options?.overwriteArray ? { arrayMerge: (_: unknown[], sourceArray: unknown[]) => sourceArray } : {})  });\n`;
      } else {
        examples += `export const get${name[0].toUpperCase() + name.slice(1)} = (props: ${name}): ${name} => (props ?? ${JSON.stringify(mocks, null, 2)});\n`;
      }

      newPersistedValues += `export const ${index} : ${name} = ${JSON.stringify(mocks, null, 2)};\n`;
    }
  }
  imports += `} from "${config.import}";\n\n`;

  newPersistedValuesImports += imports;

  // Ensure parent directory of output file exists
  const outputDir = path.dirname(config.outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(config.outputPath, imports + examples);
}

const generate = async () => {
  await generateFixtures('hosted');
  await generateFixtures('dashboard');

  createDictionaryFile(newPersistedValuesImports + newPersistedValues);
  runBiome(path.resolve('./index.ts'));
  runBiome(path.resolve('./dashboard.ts'));
};

generate();
