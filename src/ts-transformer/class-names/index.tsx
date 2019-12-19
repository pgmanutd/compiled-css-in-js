import * as ts from 'typescript';
import { isPackageModuleImport, getIdentifierText } from '../utils/ast-node';
import { visitClassNamesJsxElement } from './visitors/visit-class-names-jsx-element';

const CLASS_NAMES_NAME = 'ClassNames';

const isClassNamesFound = (sourceFile: ts.SourceFile): boolean => {
  return !!sourceFile.statements.find(statement =>
    isPackageModuleImport(statement, CLASS_NAMES_NAME)
  );
};

const isClassNameComponent = (node: ts.Node): node is ts.JsxElement => {
  return (
    ts.isJsxElement(node) && getIdentifierText(node.openingElement.tagName) === CLASS_NAMES_NAME
  );
};

export default function classNamesTransformer(_: ts.Program): ts.TransformerFactory<ts.SourceFile> {
  const transformerFactory: ts.TransformerFactory<ts.SourceFile> = context => {
    return sourceFile => {
      if (!isClassNamesFound(sourceFile)) {
        return sourceFile;
      }

      const visitor = (node: ts.Node): ts.Node => {
        if (isPackageModuleImport(node, CLASS_NAMES_NAME)) {
          return ts.createEmptyStatement();
        }

        if (isClassNameComponent(node)) {
          return visitClassNamesJsxElement(node, context);
        }

        return ts.visitEachChild(node, visitor, context);
      };

      return ts.visitNode(sourceFile, visitor);
    };
  };

  return transformerFactory;
}