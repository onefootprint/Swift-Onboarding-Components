// @ts-nocheck
import * as fs from 'fs';
import * as ts from 'typescript';

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function transformNode(node: ts.Node): ts.Node {
  if (ts.isPropertySignature(node) && ts.isIdentifier(node.name)) {
    const newName = snakeToCamel(node.name.text);
    return ts.factory.updatePropertySignature(
      node,
      node.modifiers,
      ts.factory.createIdentifier(newName),
      node.questionToken,
      transformNode(node.type!) as ts.TypeNode,
    );
  }
  if (ts.isTypeLiteralNode(node)) {
    return ts.factory.updateTypeLiteralNode(
      node,
      node.members.map(member => transformNode(member) as ts.TypeElement),
    );
  }
  if (ts.isArrayTypeNode(node)) {
    return ts.factory.updateArrayTypeNode(node, transformNode(node.elementType) as ts.TypeNode);
  }
  if (ts.isUnionTypeNode(node)) {
    return ts.factory.updateUnionTypeNode(
      node,
      node.types.map(type => transformNode(type) as ts.TypeNode),
    );
  }
  if (ts.isIntersectionTypeNode(node)) {
    return ts.factory.updateIntersectionTypeNode(
      node,
      node.types.map(type => transformNode(type) as ts.TypeNode),
    );
  }
  if (ts.isTypeReferenceNode(node)) {
    return ts.factory.updateTypeReferenceNode(
      node,
      node.typeName,
      node.typeArguments?.map(arg => transformNode(arg) as ts.TypeNode),
    );
  }
  return node;
}

function transformTypeAlias(node: ts.TypeAliasDeclaration): ts.TypeAliasDeclaration {
  return ts.factory.updateTypeAliasDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    transformNode(node.type) as ts.TypeNode,
  );
}

function transformInterface(node: ts.InterfaceDeclaration): ts.InterfaceDeclaration {
  return ts.factory.updateInterfaceDeclaration(
    node,
    node.modifiers,
    node.name,
    node.typeParameters,
    node.heritageClauses,
    node.members.map(member => transformNode(member) as ts.TypeElement),
  );
}

function transformer(context: ts.TransformationContext) {
  return (rootNode: ts.SourceFile) => {
    function visit(node: ts.Node): ts.Node {
      if (ts.isTypeAliasDeclaration(node)) {
        return transformTypeAlias(node);
      }
      if (ts.isInterfaceDeclaration(node)) {
        return transformInterface(node);
      }
      return ts.visitEachChild(node, visit, context);
    }
    return ts.visitNode(rootNode, visit);
  };
}

export function keyTypestoCamelCase(filePath: string) {
  const source = fs.readFileSync(filePath, 'utf-8');
  const sourceFile = ts.createSourceFile(filePath, source, ts.ScriptTarget.Latest, true);

  const result = ts.transform(sourceFile, [transformer]);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const transformedCode = printer.printFile(result.transformed[0] as ts.SourceFile);

  fs.writeFileSync(filePath, transformedCode, 'utf-8');
  console.log(`Updated ${filePath}`);
}
