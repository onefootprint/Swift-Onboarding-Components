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

export function injectFaker(schema: OpenAPIV3.SchemaObject, name: string): OpenAPIV3.SchemaObject {
  const enhancedSchema = { ...schema };

  if (schema.properties) {
    enhancedSchema.properties = Object.entries(schema.properties).reduce(
      (acc, [key, prop]) => {
        const property = { ...prop } as OpenAPIV3.SchemaObject;

        const matchingKey = Object.keys(propertyFakerMap).find(fakerKey => key.includes(fakerKey));
        if (matchingKey && property.type === 'string') {
          (property as { default: string }).default = propertyFakerMap[matchingKey]();
        }

        // Handle nested objects
        if (property.type === 'object' && property.properties) {
          acc![key] = injectFaker(property, name);
        }
        // Handle arrays
        else if (property.type === 'array' && property.items) {
          property.items = injectFaker(property.items as OpenAPIV3.SchemaObject, name);
          acc![key] = property;
        } else {
          acc![key] = property;
        }

        return acc;
      },
      {} as OpenAPIV3.SchemaObject['properties'],
    );
  }

  return enhancedSchema;
}
