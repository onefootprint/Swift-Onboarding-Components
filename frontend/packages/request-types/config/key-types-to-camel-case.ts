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

    const transform = (context: ts.TransformationContext) => {
      const visit = (node: ts.Node): ts.Node => {
        // Sort and transform properties within type literals and interfaces
        if (ts.isTypeLiteralNode(node) || ts.isInterfaceDeclaration(node)) {
          const members = [...node.members];

          const properties = members.filter(ts.isPropertySignature);
          const otherMembers = members.filter(m => !ts.isPropertySignature(m));

          // Transform and update each property name
          const transformedProperties = properties
            .map(prop => visitProperty(prop))
            .sort((a, b) => {
              const aName = getPropertyName(a.name) || '';
              const bName = getPropertyName(b.name) || '';
              return aName.localeCompare(bName);
            });

          if (ts.isTypeLiteralNode(node)) {
            return ts.factory.createTypeLiteralNode([
              ...transformedProperties,
              ...otherMembers.map(m => ts.visitNode(m, visit)),
            ] as ts.TypeElement[]);
          }
          if (ts.isInterfaceDeclaration(node)) {
            return ts.factory.updateInterfaceDeclaration(
              node,
              node.modifiers,
              node.name,
              node.typeParameters,
              node.heritageClauses,
              [...transformedProperties, ...otherMembers.map(m => ts.visitNode(m, visit))] as ts.TypeElement[],
            );
          }
        }

        return ts.visitEachChild(node, visit, context);
      };

      // Helper function to transform and camelCase property names
      const visitProperty = (node: ts.PropertySignature): ts.PropertySignature => {
        const name = getPropertyName(node.name);

        if (name && !shouldExclude(name)) {
          const camelCased = camelCase(name);

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
