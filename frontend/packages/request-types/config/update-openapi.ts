import fs from 'fs/promises';
import { startCase, toLower } from 'lodash';
import type {
  OpenAPIObject,
  OperationObject,
  ParameterObject,
  PathItemObject,
  SecuritySchemeObject,
} from 'openapi3-ts/oas30';

const replaceContent = (content: string, replacements: { regex: RegExp; value: string }[]) => {
  return replacements.reduce((acc, replacement) => {
    return acc.replace(replacement.regex, replacement.value);
  }, content);
};

const createHeadersFromSecuritySchemes = (openAPI: OpenAPIObject) => {
  const openAPICopy = { ...openAPI };

  if (!openAPICopy.components?.securitySchemes || !openAPICopy.paths) {
    return openAPI;
  }

  const apiKeySchemes = Object.entries(openAPICopy.components.securitySchemes)
    .filter(([_, scheme]) => (scheme as SecuritySchemeObject).type === 'apiKey')
    .map(([name, scheme]) => ({
      name,
      scheme: { ...scheme, name: (scheme as SecuritySchemeObject).name?.toLowerCase() } as SecuritySchemeObject,
    }));

  // Update each path operation
  Object.values(openAPICopy.paths).forEach((pathItem: PathItemObject) => {
    const operations: OperationObject[] = [
      pathItem.get,
      pathItem.put,
      pathItem.post,
      pathItem.delete,
      pathItem.patch,
      pathItem.options,
      pathItem.head,
    ].filter((op): op is OperationObject => op !== undefined);

    operations.forEach(operation => {
      if (!operation.parameters) {
        operation.parameters = [];
      }

      if (operation.security?.length) {
        const requiredSecuritySchemes = new Set(
          operation.security.flatMap(securityRequirement => Object.keys(securityRequirement)),
        );

        // Add required API key security schemes as headers
        const requiredApiKeySchemes = apiKeySchemes.filter(({ name }) => requiredSecuritySchemes.has(name));

        requiredApiKeySchemes.forEach(({ name, scheme }) => {
          // Check if header parameter already exists
          const headerExists = operation.parameters?.some(
            param =>
              (param as ParameterObject).in === 'header' &&
              (param as ParameterObject).name.toLocaleLowerCase() === (scheme.name || name),
          );

          if (!headerExists && operation.parameters) {
            operation.parameters.push({
              name: scheme.name || name,
              in: 'header',
              required: false,
              schema: {
                type: 'string',
              },
              description: scheme.description || `API key for ${name}`,
            });
          }
        });
      }
      operation.parameters = operation.parameters.map(param => ({
        ...param,
        // Convert the header name to capitalized kebab case
        name: startCase(toLower((param as ParameterObject).name)).replace(/\s/g, '-'),
      }));
    });
  });

  return openAPICopy;
};

// Function to provide a hotfix to the openAPI schema to unblock the frontend
export const updateOpenApi = async (filePath: string, tempPath: string) => {
  const openAPIContent = await fs.readFile(filePath, 'utf-8');

  const replacements = [
    { regex: /{fp_id:fp_\[_A-Za-z0-9\]\*}/g, value: '{fp_id}' },
    { regex: /{tag_id:tag_\[_A-Za-z0-9\]\*}/g, value: '{tag_id}' },
    { regex: /Business Owner Token/g, value: 'businessOwnerToken' },
    { regex: /Integration Testing User Onboarding Token/g, value: 'integrationTestingUserOnboardingToken' },
    { regex: /Onboarding Config Publishable Key/g, value: 'onboardingConfigPublishableKey' },
    { regex: /Onboarding Config Token/g, value: 'onboardingConfigToken' },
    { regex: /SDK Args Token/g, value: 'sdkArgsToken' },
    { regex: /Session Token/g, value: 'sessionToken' },
    { regex: /User Onboarding Token/g, value: 'userOnboardingToken' },
    { regex: /User Token/g, value: 'userToken' },
    { regex: /Custodian API Key/g, value: 'custodianApiKey' },
    { regex: /Dashboard Token/g, value: 'dashboardToken' },
    { regex: /Firm Employee Assume Token/g, value: 'firmEmployeeAssumeToken' },
    { regex: /Secret API Key/g, value: 'secretApiKey' },
  ];

  const updatedContent = replaceContent(openAPIContent, replacements);

  // Parse and type the OpenAPI specification
  const openAPI: OpenAPIObject = JSON.parse(updatedContent);

  const openAPIWithHeaders = createHeadersFromSecuritySchemes(openAPI);

  await fs.writeFile(tempPath, JSON.stringify(openAPIWithHeaders, null, 2));
};
