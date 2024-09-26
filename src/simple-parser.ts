// import * as ts from 'typescript';

// export type Position = {
//     line: number;
//     column: number;
// };

// export type IParsedNode = {
//     fn: string;
//     name: string;
//     location:
//     | {
//         source?: string | null | undefined;
//         start: Position;
//         end: Position;
//     }
//     | undefined;
//     children: IParsedNode[];
// };

// const describeKeys = ['describe', 'fdescribe'];
// const itKeys = ['it', 'fit'];
// const keysToCheck = [...describeKeys, ...itKeys];

// export function simpleParser() {
//     const rawContent = `describe('test first', () => {
//         it('should first 1', () => {});
//         it('should first 2', () => {});
//         it('should first 3', () => {});
//     });

//     describe('test second', () => {
//       it('should second 1', () => {});
//     });`;
//     const content = rawContent;
//     const sourceFile = ts.createSourceFile(
//         './',
//         content,
//         ts.ScriptTarget.Latest,
//         true
//     );

//     const getPosition = (position: number) => ({
//         line: sourceFile.getLineAndCharacterOfPosition(position).line,
//         column: sourceFile.getLineAndCharacterOfPosition(position).character
//     });

//     const getNode = (node: ts.Node): IParsedNode | undefined => {
//         if (ts.isCallExpression(node)) {
//             const { expression, arguments: args } = node;
//             if (
//                 ts.isIdentifier(expression) &&
//                 keysToCheck.includes(expression.text)
//             ) {
//                 const testName =
//                     args[0] && ts.isStringLiteral(args[0]) ? args[0].text : '';
//                 const start: Position = getPosition(node.getStart());
//                 const end: Position = getPosition(node.getEnd());
//                 return {
//                     fn: expression.text,
//                     name: testName,
//                     location: {
//                         source: 'fsPath',
//                         start,
//                         end
//                     },
//                     children: []
//                 };
//             }
//         }
//     };

//     let dataArray: IParsedNode[] = [];

//     let root: IParsedNode = {} as IParsedNode;

//     // node.getChildren().map((child) => visit(child));

//     function visit(node: ts.Node) {
//         const children = node.getChildren();
//         const childrenArray: IParsedNode[] = [];
//         children.forEach(child => {
//             const currentNode = getNode(child)
//             if (currentNode) {
//                 childrenArray.push(currentNode);
//                 console.log(currentNode)
//             }
//             visit(child)
//         });
//         const parentNode = getNode(node);
//         return { ...parentNode, children: childrenArray }
//     }

//     const data = visit(sourceFile);
//     console.log('<--------> ~ findKarmaTestsAndSuites ~ data:', data);

//     if (!root.name) {
//         root.name = `Incorrect >>>>`;
//         root.location = undefined;
//         root.children = [];
//     }

//     return [root];
// }




import * as ts from 'typescript';

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

const describeKeys = ['describe', 'fdescribe'];
const itKeys = ['it', 'fit'];
const keysToCheck = [...describeKeys, ...itKeys];

export function simpleParser(): IParsedNode[] {
    const rawContent = `describe('test first', () => {
        it('should first 1', () => {});
        it('should first 2', () => {});
        it('should first 3', () => {});
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

    const getPosition = (position: number) => ({
        line: sourceFile.getLineAndCharacterOfPosition(position).line,
        column: sourceFile.getLineAndCharacterOfPosition(position).character
    });

    const getNode = (node: ts.Node): IParsedNode | undefined => {
        if (ts.isCallExpression(node)) {
            const { expression, arguments: args } = node;
            if (
                ts.isIdentifier(expression) &&
                keysToCheck.includes(expression.text)
            ) {
                const testName =
                    args[0] && ts.isStringLiteral(args[0]) ? args[0].text : '';
                const start: Position = getPosition(node.getStart());
                const end: Position = getPosition(node.getEnd());
                return {
                    fn: expression.text,
                    name: testName,
                    location: {
                        source: 'fsPath',
                        start,
                        end
                    },
                    children: []
                };
            }
        }
    };

    const parsedNodes: IParsedNode[] = [];

    const visit = (node: ts.Node, parent: IParsedNode | null): void => {
        const currentNode = getNode(node);
        if (currentNode) {
            if (parent) {
                parent.children.push(currentNode);
            } else {
                parsedNodes.push(currentNode);
            }
            if (describeKeys.includes(currentNode.fn)) {
                node.forEachChild(child => visit(child, currentNode));
            }
        } else {
            node.forEachChild(child => visit(child, parent));
        }
    };

    visit(sourceFile, null);

    console.log('<--------> ~ findKarmaTestsAndSuites ~ output:', parsedNodes);
    return parsedNodes.length > 0
        ? parsedNodes
        : [
            {
                name: `Incorrect >>>> `,
                children: [],
                location: undefined,
                fn: ''
            }
        ];
}