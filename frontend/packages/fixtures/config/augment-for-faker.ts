import { fakerEN_US } from '@faker-js/faker';
import type { OpenAPIV3 } from 'openapi-types';

// Map of property names to faker function paths
const propertyFakerMap: Record<string, () => string> = {
  first_name: () => fakerEN_US.person.firstName(),
  last_name: () => fakerEN_US.person.lastName(),
  name: () => fakerEN_US.person.fullName(),
  email: () => fakerEN_US.internet.email({ provider: 'gmail.com' }).toLowerCase(),
  phone: () => fakerEN_US.phone.number({ style: 'international' }),
  address: () => fakerEN_US.location.streetAddress({ useFullAddress: true }),
  city: () => fakerEN_US.location.city(),
  state: () => fakerEN_US.location.state(),
  country: () => fakerEN_US.location.country(),
  zip: () => fakerEN_US.location.zipCode(),
  id: () => fakerEN_US.string.uuid(),
  key: () => fakerEN_US.string.uuid(),
  token: () => fakerEN_US.string.uuid(),
  url: () => fakerEN_US.internet.url(),
  website: () => fakerEN_US.internet.url(),
  locale: () => 'en-US',
  language: () => 'en',
};

/** Augments an open API spec to improve the quality of the generated fake values. First, we add default values for fields that appear to be certain types, like phone numbers. Second, we mutate the schema to help ensure that fake schema generation is idempotent and stable for consecutive runs. */
export function augmentForFaker(schema: OpenAPIV3.SchemaObject): OpenAPIV3.SchemaObject {
  const enhancedSchema = { ...schema };

  if (enhancedSchema.type === 'array' && enhancedSchema.items) {
    enhancedSchema.items = augmentForFaker(enhancedSchema.items as OpenAPIV3.SchemaObject);
  }

  if (enhancedSchema.anyOf?.length) {
    // In order to generate stable faker values, only select the first option of an anyOf.
    enhancedSchema.anyOf = [augmentForFaker(enhancedSchema.anyOf[0] as OpenAPIV3.SchemaObject)];
  }

  if (schema.properties) {
    enhancedSchema.properties = Object.entries(schema.properties).reduce(
      (acc, [key, prop]) => {
        const property = { ...prop } as OpenAPIV3.SchemaObject;

        // If the property's name matches a faker key, generate a default value that looks more plausible for this type of field
        const matchingKey = Object.keys(propertyFakerMap).find(fakerKey => key.includes(fakerKey));
        if (!property.example && matchingKey && property.type === 'string') {
          property.example = propertyFakerMap[matchingKey]();
        }

        // Recursively update the child schema in case it's a complex type
        acc![key] = augmentForFaker(property);

        return acc;
      },
      {} as OpenAPIV3.SchemaObject['properties'],
    );
  }

  return enhancedSchema;
}
