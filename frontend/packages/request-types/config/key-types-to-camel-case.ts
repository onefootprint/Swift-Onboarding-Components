import * as fs from 'fs/promises';
import { camelCase } from 'lodash';
import * as ts from 'typescript';

// Define the excluded prefixes
const excludePrefixes: string[] = [
  'bank.*',
  'document.',
  'id.',
  'card.*',
  'investor_profile.',
  'custom.*',
  'business.',
  'x-',
  '/',
];
export async function keyTypestoCamelCase(filePath: string): Promise<void> {
  try {
    const source = await fs.readFile(filePath, 'utf-8');
    const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

    const printer = ts.createPrinter({
      newLine: ts.NewLineKind.LineFeed,
    });

    const camelCaseCache = new Map<string, string>();

    const transform = (context: ts.TransformationContext) => {
      const visit = (node: ts.Node): ts.Node => {
        // Handle type literals (object types) for sorting
        if (ts.isTypeLiteralNode(node)) {
          const members = [...node.members];

          // Only sort PropertySignature nodes
          const properties = members.filter(ts.isPropertySignature);
          const otherMembers = members.filter(m => !ts.isPropertySignature(m));

          // Sort properties by name
          const sortedProperties = properties.sort((a, b) => {
            const aName = getPropertyName(a.name) || '';
            const bName = getPropertyName(b.name) || '';
            return aName.localeCompare(bName);
          });

          // Create new type literal with sorted properties
          return ts.factory.createTypeLiteralNode([
            ...sortedProperties.map(prop => visitProperty(prop)),
            ...otherMembers.map(m => ts.visitNode(m, visit)),
          ] as ts.TypeElement[]);
        }

        // Handle interface declarations
        if (ts.isInterfaceDeclaration(node)) {
          const members = [...node.members];

          // Only sort PropertySignature nodes
          const properties = members.filter(ts.isPropertySignature);
          const otherMembers = members.filter(m => !ts.isPropertySignature(m));

          // Sort properties by name
          const sortedProperties = properties.sort((a, b) => {
            const aName = getPropertyName(a.name) || '';
            const bName = getPropertyName(b.name) || '';
            return aName.localeCompare(bName);
          });

          // Create new interface with sorted properties
          return ts.factory.updateInterfaceDeclaration(
            node,
            node.modifiers,
            node.name,
            node.typeParameters,
            node.heritageClauses,
            [
              ...sortedProperties.map(prop => visitProperty(prop)),
              ...otherMembers.map(m => ts.visitNode(m, visit)),
            ] as ts.TypeElement[],
          );
        }

        return ts.visitEachChild(node, visit, context);
      };

      // Helper function to visit and transform properties
      const visitProperty = (node: ts.PropertySignature): ts.PropertySignature => {
        const name = getPropertyName(node.name);
        if (name && !shouldExclude(name)) {
          let camelCased = camelCaseCache.get(name);
          if (!camelCased) {
            camelCased = camelCase(name);
            camelCaseCache.set(name, camelCased as string);
          }

          if (camelCased !== name) {
            return ts.factory.updatePropertySignature(
              node,
              node.modifiers,
              ts.factory.createIdentifier(camelCased as string),
              node.questionToken,
              ts.visitNode(node.type, visit) as ts.TypeNode,
            );
          }
        }

        return ts.factory.updatePropertySignature(
          node,
          node.modifiers,
          node.name,
          node.questionToken,
          ts.visitNode(node.type, visit) as ts.TypeNode,
        );
      };

      return (node: ts.Node) => ts.visitNode(node, visit);
    };

    const result = ts.transform(sourceFile, [transform]);
    const transformedSourceFile = result.transformed[0];

    const output = printer.printNode(ts.EmitHint.Unspecified, transformedSourceFile, sourceFile);

    await fs.writeFile(filePath, output);
    result.dispose();
  } catch (error) {
    throw new Error(`Failed to transform ${filePath}: ${error}`);
  }
}

function getPropertyName(node: ts.PropertyName): string | undefined {
  if (ts.isIdentifier(node)) {
    return node.text;
  }
  if (ts.isStringLiteral(node)) {
    return node.text;
  }
  return undefined;
}

function shouldExclude(propertyName: string): boolean {
  return excludePrefixes.some(prefix => propertyName.startsWith(prefix));
}
