import type { Content, ContentSchema } from '../api-reference.types';
import staticApiData from '../assets/api-docs.json';
import staticPreviewData from '../assets/api-preview-docs.json';
import hostedApiData from '../assets/hosted-api-docs.json';
import phasedOutApiData from '../assets/phased-out-api-docs.json';
import privateApiData from '../assets/private-api-docs.json';

export const maybeEvaluateSchemaRef = (schema: ContentSchema | undefined) => {
  if (schema?.$ref) {
    return evaluateSchemaRef(schema.$ref);
  }
  return schema;
};

export const evaluateSchemaRef = (ref: string) => {
  const parts = ref?.split('/');
  const key = parts[parts.length - 1];
  return getSchema(key);
};

const getSchema = (schemaKey: string) => {
  const schema = staticApiData.components.schemas[schemaKey as keyof typeof staticApiData.components.schemas] as
    | ContentSchema
    | undefined;
  const previewSchema = staticPreviewData.components.schemas[
    schemaKey as keyof typeof staticPreviewData.components.schemas
  ] as ContentSchema | undefined;
  const phasedOutSchema = phasedOutApiData.components.schemas[
    schemaKey as keyof typeof phasedOutApiData.components.schemas
  ] as ContentSchema | undefined;
  // TODO this logic is pretty messy... we shouldn't do this with globals
  const hostedSchemas = hostedApiData.components.schemas[schemaKey as keyof typeof hostedApiData.components.schemas] as
    | ContentSchema
    | undefined;
  const privateSchema = privateApiData.components.schemas[
    schemaKey as keyof typeof privateApiData.components.schemas
  ] as ContentSchema | undefined;

  return schema || previewSchema || phasedOutSchema || hostedSchemas || privateSchema || undefined;
};

// Open API allows us to use "format"s other than the default ones. We should eventually have the
// backend provide data types for each of these fields instead of inferring based on the name
// https://swagger.io/docs/specification/data-models/data-types/#string
const DefaultFieldValues: Record<string, string> = {
  onboarding_config_key: 'pb_live_fZvYlX3JpanlQ3MAwE45g0',
  key: 'ob_live_fZvYlX3JpanlQ3MAwE45g0',
  playbook_key: 'ob_live_fZvYlX3JpanlQ3MAwE45g0',
  fp_id: 'fp_id_7p793EF07xKXHqAeg5VGPj',
  fp_bid: 'fp_bid_xIMR8HSsaGvKtiwosEsvV0',
  fp_user_id: 'fp_id_7p793EF07xKXHqAeg5VGPj',
  ip_address: '192.168.1.1',
};

export const getExample = (schema?: ContentSchema, name?: string, index = 0): unknown => {
  if (!schema) {
    return null;
  }
  if (schema.$ref) {
    // Some schemas are just pointers to schemas defined elsewhere - evaluate the schema ref
    // and then return its example
    const referencedSchema = evaluateSchemaRef(schema.$ref);
    return getExample(referencedSchema);
  }
  if (schema.example !== undefined) {
    // Some schemas have a hardcoded example. `null` is a valid hardcoded example
    return schema.example;
  }
  if (schema.type === 'string') {
    // There are many different formats of strings - choose the ideal display
    if (schema.enum) {
      return schema.enum[index];
    }
    if (name && name in DefaultFieldValues) {
      return DefaultFieldValues[name];
    }
    if (schema.format) {
      if (schema.format === 'date-time') {
        return '2022-01-04T12:00-07:00';
      }
      if (schema.format === 'binary') {
        return 'ba5eba11';
      }
    } else {
      return 'Lorem ipsum dolor';
    }
  }
  if (schema.type === 'number' || schema.type === 'integer') {
    return 1;
  }
  if (schema.type === 'boolean') {
    return true;
  }
  if (schema.type === 'array') {
    // Recursively show two example items in an array
    const sampleItem0 = getExample(schema.items, undefined, 0);
    const sampleItem1 = getExample(schema.items, undefined, 1);
    return [sampleItem0, sampleItem1];
  }
  if (schema.type === 'object') {
    // Recursively show each property and its schema
    if (schema.properties) {
      const properties = Object.keys(schema.properties!)
        .map(k => {
          const propSchema = schema.properties![k];
          return [k, getExample(propSchema, k)];
        })
        // Omit fields that have a null or undefined example
        .filter(([_, v]) => v !== null && v !== undefined);
      return Object.fromEntries(properties);
    }

    return {};
  }
  console.error("Couldn't generate a spec for", name, schema);
  return null;
};

export default getSchema;
