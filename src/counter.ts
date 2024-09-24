export type Position = {
  line: number;
  column: number;
};

export type IParsedNode = {
  fn: string;
  name: string;
  location:
    | {
        source?: string | null | undefined;
        start: Position;
        end: Position;
      }
    | undefined;
  children: IParsedNode[];
};

import * as ts from 'typescript';
export function findKarmaTestsAndSuites() {
  const rawContent = `describe('test first', () => {
    it('should first 1', () => {});
});

describe('test second', () => {
  it('should second 1', () => {});
});`;
  const content = rawContent;
  const sourceFile = ts.createSourceFile(
    './',
    content,
    ts.ScriptTarget.Latest,
    true
  );

  let root: IParsedNode = {} as IParsedNode;

  function visit(node: ts.Node, parent: IParsedNode | null) {
    // console.log('++++', node);
    if (ts.isCallExpression(node)) {
      const { expression, arguments: args } = node;
      if (
        ts.isIdentifier(expression) &&
        (expression.text === 'describe' ||
          expression.text === 'it' ||
          expression.text === 'fdescribe' ||
          expression.text === 'fit')
      ) {
        console.log('length', args.length);
        const testName =
          args[0] && ts.isStringLiteral(args[0]) ? args[0].text : '';
        console.log('testName: ', testName);
        const start: Position = {
          line: sourceFile.getLineAndCharacterOfPosition(node.getStart()).line,
          column: sourceFile.getLineAndCharacterOfPosition(node.getStart())
            .character,
        };
        const end: Position = {
          line: sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line,
          column: sourceFile.getLineAndCharacterOfPosition(node.getEnd())
            .character,
        };
        const newNode: IParsedNode = {
          fn: expression.text as 'describe' | 'it',
          name: testName,
          location: {
            source: 'filePath',
            start,
            end,
          },
          children: [],
        };
        if (parent) {
          parent.children.push(newNode);
        } else {
          root = { ...newNode };
        }
        if (expression.text === 'describe' || expression.text === 'fdescribe') {
          ts.forEachChild(node, (child) => visit(child, newNode));
        }
      }
    } else {
      ts.forEachChild(node, (child) => visit(child, parent));
    }
  }

  // sourceFile.forEachChild((child) => {
  //   // console.log(child);
  //   visit(child, null);
  // });
  visit(sourceFile, null);

  if (!root.name) {
    root.name = `Incorrect >>>>`;
    root.location = undefined;
    root.children = [];
  }

  return root;
}
