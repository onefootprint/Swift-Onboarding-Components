import fs from 'fs';
import path from 'path';
import $RefParser from '@apidevtools/json-schema-ref-parser';
import { runBiome } from '@onefootprint/request-types/config/run-biome';
import { JSONSchemaFaker } from 'json-schema-faker';
import _ from 'lodash';
import merge from 'lodash/merge';
import type { OpenAPIV3 } from 'openapi-types';
import { injectFaker } from './inject-faker';
import { persistedValues } from './persisted-values';
import { createDictionaryFile, sortObjectKeys, toCamelCase } from './utils';

JSONSchemaFaker.option({
  minItems: 3,
  maxItems: 3,
  fillProperties: false,
  useDefaultValue: true,
});

const dictionary: Record<string, unknown> = {};

export async function generateFixtures(type: 'hosted' | 'dashboard') {
  let examples = '';
  let imports = 'import merge from "lodash/merge";\nimport type { \n';

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
        acc[name] = injectFaker(schema as OpenAPIV3.SchemaObject, name);
        return acc;
      },
      {} as Record<string, OpenAPIV3.SchemaObject>,
    );

    for (const [name, schema] of Object.entries(enhancedSchemas)) {
      imports += `${name},\n`;
      const example = await JSONSchemaFaker.resolve(schema, spec.components?.schemas);

      const index = `${type}.${name}`;

      dictionary[index] = persistedValues[index]
        ? _.isObject(persistedValues[index])
          ? merge(example, persistedValues[index])
          : persistedValues[index]
        : example;

      const mocks = _.isObject(dictionary[index]) ? sortObjectKeys(toCamelCase(dictionary[index])) : dictionary[index];

      if (_.isObject(dictionary[index])) {
        examples += `export const get${name[0].toUpperCase() + name.slice(1)} = (props: Partial<${name}>) => merge(${JSON.stringify(mocks, null, 2)}, props) as ${name};\n`;
      } else {
        examples += `export const get${name[0].toUpperCase() + name.slice(1)} = (props: Partial<${name}>) => (props ?? ${JSON.stringify(mocks, null, 2)}) as ${name};\n`;
      }
    }
  }
  imports += `} from "${config.import}";\n\n`;

  createDictionaryFile(dictionary);

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
  runBiome(path.resolve('./index.ts'));
  runBiome(path.resolve('./dashboard.ts'));
};

generate();
