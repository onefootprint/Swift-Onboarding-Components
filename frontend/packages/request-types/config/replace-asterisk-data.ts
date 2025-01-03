import * as fs from 'fs/promises';

const replaceWildcardAsString = `
type ReplaceWildcard<T, WildcardReplacement extends string> = {
  [K in keyof T as K extends \`\${infer P}.*.\${infer S}\`
    ? \`\${P}.\${WildcardReplacement}.\${S}\`
    : K extends \`\${infer P}.*\`
    ? \`\${P}.\${WildcardReplacement}\`
    : K]: T[K];
};
`.trim();

const replaceUnionTypes = (fileContent: string) => {
  const typesWithUnions = [
    'DataIdentifier',
    'UserDataIdentifier',
    'PostHostedUserUploadByDocumentIdentifierData',
    'RawUserDataRequest',
    'UserDecryptResponse',
    'UserDeleteResponse',
    'PostBusinessesByFpBidVaultByIdentifierUploadData',
    'PostEntitiesVaultByIdentifierUploadData',
    'GetEntitiesByFpIdVaultData',
    'PostEntitiesByFpIdVaultByIdentifierUploadData',
    'GetUserVaultResponse',
    '_key_',
    'IntegrityResponse',
  ]; // Add your type names here

  // Process the content
  return (
    fileContent
      // Match lines starting with "|", containing wildcard `*`, and replace appropriately
      .replace(/^\s*\|\s*'(.*?\*.*?)'/gm, (_, match) => {
        const updatedMatch = match.replace(/\*\./g, '${T}.').replace(/\*/g, '${T}'); // Replace both `*.` and `*`
        return `| \`${updatedMatch}\``; // Wrap in backticks
      })
      // Add generic `<T extends string = string>` to specified types
      .replace(
        /export type (\w+) =/g, // Match all `export type TypeName =`
        (_, typeName) =>
          typesWithUnions.includes(typeName)
            ? `export type ${typeName}<T extends string = string> =` // Add generic to specified types
            : `export type ${typeName} =`, // Leave other types unchanged
      )
  );
};

const replaceWildcardKeys = (fileContent: string) => {
  const typeNamesToTransform = [
    'ModernRawBusinessDataRequest',
    'ModernBusinessDecryptResponse',
    'ModernEntityDecryptResponse',
    'VaultData',
  ];

  // Track transformed types to ensure only the next "};" is replaced
  const transformedTypes: Set<string> = new Set();

  // Build a regex to match the type names in the provided array
  const typePattern = new RegExp(`export type (${typeNamesToTransform.join('|')}) = \\{`, 'g');

  // Transform type declaration and track transformed types
  return (
    fileContent
      .replace(typePattern, (_, typeName) => {
        transformedTypes.add(typeName);
        return `export type ${typeName}<T extends string = string> = ReplaceWildcard<{`;
      })
      // Replace only the next "};" for each transformed type
      .replace(/};/g, (match, offset, string) => {
        // Find the preceding transformed type
        for (const typeName of transformedTypes) {
          const precedingDeclaration = `export type ${typeName}<T extends string = string> = ReplaceWildcard<{`;
          if (string.slice(0, offset).includes(precedingDeclaration)) {
            // Remove the type from the set after processing its first "};"
            transformedTypes.delete(typeName);
            return '}, T>;';
          }
        }

        return match; // Leave unmatched "};" as is
      })
  );
};

export const replaceAsteriskData = async (filePath: string) => {
  const fileContent = await fs.readFile(filePath, 'utf8');
  const updatedContent = replaceUnionTypes(fileContent);
  const updatedContentWithWildcardKeys = replaceWildcardKeys(updatedContent);
  await fs.writeFile(filePath, `${replaceWildcardAsString}\n\n${updatedContentWithWildcardKeys}`);
};
