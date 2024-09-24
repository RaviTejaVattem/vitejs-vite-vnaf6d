import * as ts from 'typescript';

const rawContent = `describe('test first', () => {
  it('should first 1', () => {});
});

describe('test second', () => {
it('should second 1', () => {});
});`;

function findDescribeBlocks(sourceFile: ts.SourceFile): ts.Node[] {
  const describeBlocks: ts.Node[] = [];

  function visit(node: ts.Node) {
    if (ts.isCallExpression(node)) {
      const { expression, arguments: args } = node;
      if (
        ts.isIdentifier(expression) &&
        (expression.text === 'describe' || expression.text === 'it')
      ) {
        const testName =
          args[0] && ts.isStringLiteral(args[0]) ? args[0].text : '';
        console.log('testName: ', testName);
        describeBlocks.push(node);
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  return describeBlocks;
}

// Usage example
const sourceCode = ts.createSourceFile(
  './',
  rawContent,
  ts.ScriptTarget.Latest,
  true
);
export const describeBlocks = findDescribeBlocks(sourceCode);
