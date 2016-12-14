/**
 * @fileoverview This option sets a specific tab width for your code
 *
 * This rule has been ported and modified from nodeca.
 * @author Vitaly Puzrin
 * @author Gyandeep Singh
 */

"use strict";

const lodash = require("lodash");

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

module.exports = {
    meta: {
        docs: {
            description: "enforce consistent indentation",
            category: "Stylistic Issues",
            recommended: false
        },

        fixable: "whitespace",

        schema: [
            {
                oneOf: [
                    {
                        enum: ["tab"]
                    },
                    {
                        type: "integer",
                        minimum: 0
                    }
                ]
            },
            {
                type: "object",
                properties: {
                    SwitchCase: {
                        type: "integer",
                        minimum: 0
                    },
                    VariableDeclarator: {
                        oneOf: [
                            {
                                type: "integer",
                                minimum: 0
                            },
                            {
                                type: "object",
                                properties: {
                                    var: {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    let: {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    const: {
                                        type: "integer",
                                        minimum: 0
                                    }
                                },
                                additionalProperties: false
                            }
                        ]
                    },
                    outerIIFEBody: {
                        type: "integer",
                        minimum: 0
                    },
                    MemberExpression: {
                        type: "integer",
                        minimum: 0
                    },
                    FunctionDeclaration: {
                        type: "object",
                        properties: {
                            parameters: {
                                oneOf: [
                                    {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    {
                                        enum: ["first"]
                                    }
                                ]
                            },
                            body: {
                                type: "integer",
                                minimum: 0
                            }
                        },
                        additionalProperties: false
                    },
                    FunctionExpression: {
                        type: "object",
                        properties: {
                            parameters: {
                                oneOf: [
                                    {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    {
                                        enum: ["first"]
                                    }
                                ]
                            },
                            body: {
                                type: "integer",
                                minimum: 0
                            }
                        },
                        additionalProperties: false
                    },
                    CallExpression: {
                        type: "object",
                        properties: {
                            arguments: {
                                oneOf: [
                                    {
                                        type: "integer",
                                        minimum: 0
                                    },
                                    {
                                        enum: ["first"]
                                    }
                                ]
                            }
                        },
                        additionalProperties: false
                    },
                    ArrayExpression: {
                        oneOf: [
                            {
                                type: "integer",
                                minimum: 0
                            },
                            {
                                enum: ["first"]
                            }
                        ]
                    },
                    ObjectExpression: {
                        oneOf: [
                            {
                                type: "integer",
                                minimum: 0
                            },
                            {
                                enum: ["first"]
                            }
                        ]
                    }
                },
                additionalProperties: false
            }
        ]
    },

    create(context) {
        const DEFAULT_VARIABLE_INDENT = 1;
        const DEFAULT_PARAMETER_INDENT = null; // For backwards compatibility, don't check parameter indentation unless specified in the config
        const DEFAULT_FUNCTION_BODY_INDENT = 1;

        let indentType = "space";
        let indentSize = 4;
        const options = {
            SwitchCase: 0,
            VariableDeclarator: {
                var: DEFAULT_VARIABLE_INDENT,
                let: DEFAULT_VARIABLE_INDENT,
                const: DEFAULT_VARIABLE_INDENT
            },
            outerIIFEBody: 1,
            FunctionDeclaration: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT
            },
            FunctionExpression: {
                parameters: DEFAULT_PARAMETER_INDENT,
                body: DEFAULT_FUNCTION_BODY_INDENT
            },
            CallExpression: {
                arguments: DEFAULT_PARAMETER_INDENT
            },
            MemberExpression: null,
            ArrayExpression: 1,
            ObjectExpression: 1,
            ArrayPattern: 1,
            ObjectPattern: 1
        };

        /*
         * General rule strategy:
         * 1. Create a hashmap (`desiredOffsets`). The keys are all the tokens and comments in the file, and the values are objects
         *    containing information for a specific offset, measured in indent levels, from a either a specific token or the first column.
         *    For example, an element in an array will have {offset: 1, from: openingBracket} to indicate that it is offset by one indentation
         *    level from the opening square bracket. All the offsets are initialized to 0 at the start.
         * 2. As the AST is traversed, modify the offsets of tokens accordingly. For example, when entering a BlockStatement, offset
         *    all of the tokens in the BlockStatement by 1 from the opening curly brace of the BlockStatement.
         * 3. After traversing the AST, calculate the expected indentation levels of every token in the file (according to the
         *    `desiredOffsets` map).
         * 4. For each token, compare the expected indentation to the actual indentation in the file, and report the token if
         *    the two values are not equal.
         */

        const sourceCode = context.getSourceCode();
        const ignoredTokens = new WeakSet();
        const desiredOffsets = sourceCode.tokensAndComments.reduce((map, token) => map.set(token, { offset: 0, from: null }), new WeakMap());
        const parameterParens = new WeakSet();
        const firstTokensByLineNumber = sourceCode.tokensAndComments.reduce((map, token) => {
            if (!map.has(token.loc.start.line)) {
                map.set(token.loc.start.line, token);
            }
            if (!map.has(token.loc.end.line)) {
                map.set(token.loc.end.line, token);
            }
            return map;
        }, new Map());

        if (context.options.length) {
            if (context.options[0] === "tab") {
                indentSize = 1;
                indentType = "tab";
            } else if (typeof context.options[0] === "number") {
                indentSize = context.options[0];
                indentType = "space";
            }

            if (context.options[1]) {
                lodash.merge(options, context.options[1]);

                if (typeof options.VariableDeclarator === "number") {
                    options.VariableDeclarator = {
                        var: options.VariableDeclarator,
                        let: options.VariableDeclarator,
                        const: options.VariableDeclarator
                    };
                }
            }
        }

        /**
         * Creates an error message for a line, given the expected/actual indentation.
         * @param {int} expectedAmount The expected amount of indentation characters for this line
         * @param {int} actualSpaces The actual number of indentation spaces that were found on this line
         * @param {int} actualTabs The actual number of indentation tabs that were found on this line
         * @returns {string} An error message for this line
         */
        function createErrorMessage(expectedAmount, actualSpaces, actualTabs) {
            const expectedStatement = `${expectedAmount} ${indentType}${expectedAmount === 1 ? "" : "s"}`; // e.g. "2 tabs"
            const foundSpacesWord = `space${actualSpaces === 1 ? "" : "s"}`; // e.g. "space"
            const foundTabsWord = `tab${actualTabs === 1 ? "" : "s"}`; // e.g. "tabs"
            let foundStatement;

            if (actualSpaces > 0) {

                // Abbreviate the message if the expected indentation is also spaces.
                // e.g. 'Expected 4 spaces but found 2' rather than 'Expected 4 spaces but found 2 spaces'
                foundStatement = indentType === "space" ? actualSpaces : `${actualSpaces} ${foundSpacesWord}`;
            } else if (actualTabs > 0) {
                foundStatement = indentType === "tab" ? actualTabs : `${actualTabs} ${foundTabsWord}`;
            } else {
                foundStatement = "0";
            }

            return `Expected indentation of ${expectedStatement} but found ${foundStatement}.`;
        }

        /**
         * Get the actual indent of node
         * @param {Token} token Token to examine
         * @returns {Object} The node's indent. Contains keys `space` and `tab`, representing the indent of each character. Also
         contains keys `goodChar` and `badChar`, where `goodChar` is the amount of the user's desired indentation character, and
         `badChar` is the amount of the other indentation character.
         */
        function getTokenIndent(token) {
            const srcCharsBeforeToken = Array.from(sourceCode.getText(token, token.loc.start.column));
            const indentChars = srcCharsBeforeToken.slice(0, srcCharsBeforeToken.findIndex(char => char !== " " && char !== "\t"));
            const spaces = indentChars.filter(char => char === " ").length;
            const tabs = indentChars.filter(char => char === "\t").length;

            return {
                space: spaces,
                tab: tabs,
                goodChar: indentType === "space" ? spaces : tabs,
                badChar: indentType === "space" ? tabs : spaces
            };
        }

        /**
         * Reports a given indent violation
         * @param {Token} token Node violating the indent rule
         * @param {int} neededIndentLevel Expected indentation level
         * @param {int} gottenSpaces Indentation space count in the actual node/code
         * @param {int} gottenTabs Indentation tab count in the actual node/code
         * @returns {void}
         */
        function report(token, neededIndentLevel) {
            const actualIndent = getTokenIndent(token);
            const neededChars = neededIndentLevel * indentSize;

            context.report({
                node: token,
                message: createErrorMessage(neededChars, actualIndent.space, actualIndent.tab),
                loc: { line: token.loc.start.line, column: token.loc.start.column },
                fix(fixer) {
                    const range = [token.range[0] - token.loc.start.column, token.range[0]];
                    const newText = (indentType === "space" ? " " : "\t").repeat(neededChars);

                    return fixer.replaceTextRange(range, newText);
                }
            });
        }

        /**
        * Gets the first token on a given token's line
        * @param {Token|ASTNode} token a node or token
        * @returns {Token} The first token on the given line
        */
        function getFirstTokenOfLine(token) {
            return firstTokensByLineNumber.get(token.loc.start.line);
        }

        /**
         * Checks if a token's indentation is correct
         * @param {Token} token Token to examine
         * @param {int} desiredIndentLevel needed indent level
         * @returns {boolean} `true` if the token's indentation is correct
         */
        function validateTokenIndent(token, desiredIndentLevel) {
            const tokenIndent = getTokenIndent(token);

            if (tokenIndent.space && tokenIndent.tab) {

                // To avoid conflicts with no-mixed-spaces-and-tabs, don't report mixed spaces and tabs.
                return true;
            }

            return tokenIndent.goodChar === desiredIndentLevel * indentSize && tokenIndent.badChar === 0;
        }

        /**
        * Sets the indent of token B to match the indent of token A.
        * @param {Token} tokenA The first token
        * @param {Token} tokenB The second token, whose indent should be matched to the first token
        * @returns {void}
        */
        function matchIndentOf(tokenA, tokenB) {
            if (tokenA !== tokenB) {
                desiredOffsets.set(tokenB, { offset: 0, from: tokenA });
            }
        }

        /**
        * Sets the desired offset of a token
        * @param {Token} token The token
        * @param {Token} offsetFrom The token that this is offset from
        * @param {number} offset The desired indent level
        * @returns {void}
        */
        function setDesiredOffset(token, offsetFrom, offset) {
            if (offsetFrom && token.loc.start.line === offsetFrom.loc.start.line) {
                matchIndentOf(offsetFrom, token);
            } else {
                desiredOffsets.set(token, { offset, from: offsetFrom });
            }
        }

        /**
        * Sets the desired offset of multiple tokens
        * @param {Token[]} tokens A list of tokens
        * @param {Token} offsetFrom The token that this is offset from
        * @param {number} offset The desired indent level
        * @returns {void}
        */
        function setDesiredOffsets(tokens, offsetFrom, offset) {
            tokens.forEach(token => setDesiredOffset(token, offsetFrom, offset));
        }

        const desiredIndentCache = new WeakMap();

        /**
        * Gets the desired indent of a token
        * @param {Token} token The token
        * @returns {number} The desired indent of the token
        */
        function getDesiredIndent(token) {
            if (!desiredIndentCache.has(token)) {

                if (ignoredTokens.has(token)) {

                    // If the token is ignored, use the actual indent of the token as the desired indent.
                    // This ensures that no errors are reported for this token.
                    desiredIndentCache.set(token, getTokenIndent(token).goodChar / indentSize);
                } else {
                    const offsetInfo = desiredOffsets.get(token);

                    desiredIndentCache.set(token, offsetInfo.offset + (offsetInfo.from ? getDesiredIndent(offsetInfo.from) : 0));
                }
            }
            return desiredIndentCache.get(token);
        }

        /**
        * Ignores a token, preventing it from being reported.
        * @param {Token} token The token
        * @returns {void}
        */
        function ignoreToken(token) {
            if (token === getFirstTokenOfLine(token)) {
                ignoredTokens.add(token);
            }
        }

        /**
         * Check to see if the node is a file level IIFE
         * @param {ASTNode} node The function node to check.
         * @returns {boolean} True if the node is the outer IIFE
         */
        function isOuterIIFE(node) {

            /*
             * Verify that the node is an IIFE
             */
            if (!node.parent || node.parent.type !== "CallExpression" || node.parent.callee !== node) {
                return false;
            }

            /*
             * Navigate legal ancestors to determine whether this IIFE is outer.
             * A "legal ancestor" is an expression or statement that causes the function to get executed immediately.
             * For example, `!(function(){})()` is an outer IIFE even though it is preceded by a ! operator.
             */
            let statement = node.parent && node.parent.parent;

            while (
                statement.type === "UnaryExpression" && ["!", "~", "+", "-"].indexOf(statement.operator) > -1 ||
                statement.type === "AssignmentExpression" ||
                statement.type === "LogicalExpression" ||
                statement.type === "SequenceExpression" ||
                statement.type === "VariableDeclarator"
            ) {
                statement = statement.parent;
            }

            return (statement.type === "ExpressionStatement" || statement.type === "VariableDeclaration") && statement.parent.type === "Program";
        }

        const tokensByNodeCache = new WeakMap();

        /**
        * Gets all tokens and comments for a node
        * @param {ASTNode} node The node
        * @returns {Token[]} A list of tokens and comments
        */
        function getTokensAndComments(node) {
            if (!node) {
                return sourceCode.tokensAndComments;
            }

            if (!tokensByNodeCache.has(node)) {
                const parentTokens = getTokensAndComments(node.parent);
                const firstTokenIndex = lodash.sortedIndexBy(parentTokens, sourceCode.getFirstToken(node), token => token.range[0]);
                const lastTokenIndex = lodash.sortedIndexBy(parentTokens, sourceCode.getLastToken(node), token => token.range[0]);
                const nodeTokens = parentTokens.slice(firstTokenIndex, lastTokenIndex + 1);

                tokensByNodeCache.set(node, nodeTokens);
            }

            return tokensByNodeCache.get(node);
        }

        /**
         * Check indentation for blocks
         * @param {ASTNode} node node to check
         * @returns {void}
         */
        function addBlockIndent(node) {

            let blockIndentLevel;
            const tokens = getTokensAndComments(node);

            if (node.parent && isOuterIIFE(node.parent)) {
                blockIndentLevel = options.outerIIFEBody;
            } else if (node.parent && (node.parent.type === "FunctionExpression" || node.parent.type === "ArrowFunctionExpression")) {
                blockIndentLevel = options.FunctionExpression.body;
            } else if (node.parent && node.parent.type === "FunctionDeclaration") {
                blockIndentLevel = options.FunctionDeclaration.body;
            } else {
                blockIndentLevel = 1;
            }

            /*
             * If the block starts on its own line, then match the tokens in the block against the opening curly of the block.
             * Otherwise, match the token in the block against the tokens in the block's parent.
             *
             * For example:
             * function foo() {
             *   {
             *      // (random block, tokens should get matched against the { that opens the block)
             *      foo;
             *   }
             *
             * if (foo &&
             *     bar) {
             *     baz(); // Tokens in the block should get matched against the `if` statement, even though the opening curly is indented.
             * }
             */
            const tokenToMatchAgainst = getFirstTokenOfLine(tokens[0]) === tokens[0] ? tokens[0] : sourceCode.getFirstToken(node.parent);

            if (tokenToMatchAgainst !== tokens[0]) {
                matchIndentOf(tokenToMatchAgainst, tokens[0]);
            }
            setDesiredOffsets(tokens.slice(1, -1), tokens[0], blockIndentLevel);
            matchIndentOf(tokenToMatchAgainst, tokens[tokens.length - 1]);
        }

        /**
        * Check indentation for lists of elements (arrays, objects, function params)
        * @param {Token[]} tokens list of tokens
        * @param {ASTNode[]} elements List of elements that should be offset
        * @param {number} offset The amount that the elements should be offset
        * @returns {void}
        */
        function addElementListIndent(tokens, elements, offset) {

            /**
            * Gets the first token of a given element, including surrounding parentheses.
            * @param {ASTNode} element A node in the `elements` list
            * @returns {Token} The first token of this element
            */
            function getFirstToken(element) {
                let token = sourceCode.getTokenBefore(sourceCode.getFirstToken(element));

                while (token.type === "Punctuator" && token.value === "(" && token !== tokens[0]) {
                    token = sourceCode.getTokenBefore(token);
                }

                return sourceCode.getTokenAfter(token);
            }

            if (offset === "first" && elements.length) {
                ignoreToken(getFirstToken(elements[0]));
            }

            // Run through all the tokens in the list, and offset them by one indent level (mainly for comments, other things will end up overridden)
            setDesiredOffsets(tokens.slice(1, -1), tokens[0], offset === "first" ? 1 : offset);
            elements.forEach((element, index) => {
                if (index === 0) {
                    return;
                }
                if (offset === "first") {
                    setDesiredOffset(getFirstToken(elements[index]), null, getFirstToken(elements[0]).loc.start.column / indentSize);
                } else {
                    const previousElement = elements[index - 1];
                    const firstTokenOfPreviousElement = previousElement && getFirstToken(previousElement);

                    if (previousElement && previousElement.loc.end.line > tokens[0].loc.end.line) {
                        matchIndentOf(firstTokenOfPreviousElement, getFirstToken(elements[index]));
                    }
                }
            });
            matchIndentOf(tokens[0], tokens[tokens.length - 1]);
        }

        /**
         * Check indent for array block content or object block content
         * @param {ASTNode} node node to examine
         * @returns {void}
         */
        function addArrayOrObjectIndent(node) {
            const tokens = getTokensAndComments(node);

            addElementListIndent(tokens, node.elements || node.properties, options[node.type]);
        }

        /**
         * Check and decide whether to check for indentation for blockless nodes
         * Scenarios are for or while statements without braces around them
         * @param {ASTNode} node node to examine
         * @param {ASTNode} parent The parent of the node to examine
         * @returns {void}
         */
        function addBlocklessNodeIndent(node, parent) {
            if (node.type !== "BlockStatement") {
                setDesiredOffsets(getTokensAndComments(node), sourceCode.getFirstToken(parent), 1);
            }
        }

        /**
        * Checks the indentation of a function's parameters
        * @param {ASTNode} node The node
        * @param {number} paramsIndent The indentation level option for the parameters
        * @returns {void}
        */
        function addFunctionParamsIndent(node, paramsIndent) {
            const openingParen = node.params.length ? sourceCode.getTokenBefore(node.params[0]) : sourceCode.getTokenBefore(node.body, 1);
            const closingParen = sourceCode.getTokenBefore(node.body);
            const nodeTokens = getTokensAndComments(node);
            const openingParenIndex = lodash.sortedIndexBy(nodeTokens, openingParen, token => token.range[0]);
            const closingParenIndex = lodash.sortedIndexBy(nodeTokens, closingParen, token => token.range[0]);
            const paramTokens = nodeTokens.slice(openingParenIndex, closingParenIndex + 1);

            parameterParens.add(paramTokens[0]);
            parameterParens.add(paramTokens[paramTokens.length - 1]);

            addElementListIndent(paramTokens, node.params, paramsIndent);

            if (typeof paramsIndent !== "number" && typeof paramsIndent !== "string") {
                node.params.forEach(param => ignoreToken(sourceCode.getFirstToken(param)));
            }
        }

        /**
        * Adds indentation for the right-hand side of binary/logical expressions.
        * @param {ASTNode} node A BinaryExpression or LogicalExpression node
        * @returns {void}
        */
        function addBinaryOrLogicalExpressionIndent(node) {
            const tokens = getTokensAndComments(node);
            const operator = sourceCode.getTokensBetween(node.left, node.right).find(token => token.value === node.operator);
            const firstTokenAfterOperator = sourceCode.getTokenAfter(operator);
            const tokensAfterOperator = tokens.slice(lodash.sortedIndexBy(tokens, firstTokenAfterOperator, token => token.range[0]));

            /*
             * For backwards compatibility, don't check BinaryExpression indents, e.g.
             * var foo = bar &&
             *                   baz;
             */

            ignoreToken(operator);
            ignoreToken(tokensAfterOperator[0]);
            setDesiredOffset(tokensAfterOperator[0], sourceCode.getFirstToken(node), 1);
            setDesiredOffsets(tokensAfterOperator.slice(1), tokensAfterOperator[0], 1);
        }

        /**
        * Checks the indentation of `IfStatement` nodes.
        * @param {ASTNode} node An `IfStatement` node
        * @returns {void}
        */
        function addIfStatementIndent(node) {
            addBlocklessNodeIndent(node.consequent, node);
            if (node.alternate) {
                if (node.alternate.type === "IfStatement") {
                    addIfStatementIndent(node.alternate, node);
                } else {
                    addBlocklessNodeIndent(node.alternate, node);
                }
            }
        }

        /**
        * Checks the indentation for nodes that are like function calls (`CallExpression` and `NewExpression`)
        * @param {ASTNode} node A CallExpression or NewExpression node
        * @returns {void}
        */
        function addFunctionCallIndent(node) {
            let openingParen;

            if (node.arguments.length) {
                openingParen = sourceCode.getTokensBetween(node.callee, node.arguments[0]).find(token => token.value === "(");
            } else {
                openingParen = sourceCode.getLastToken(node, 1);
            }
            const callExpressionTokens = getTokensAndComments(node);
            const tokens = callExpressionTokens.slice(lodash.sortedIndexBy(callExpressionTokens, openingParen, token => token.range[0]));

            parameterParens.add(tokens[0]);
            parameterParens.add(tokens[tokens.length - 1]);
            matchIndentOf(sourceCode.getLastToken(node.callee), openingParen);

            if (typeof options.CallExpression.arguments === "number" || typeof options.CallExpression.arguments === "string") {
                addElementListIndent(tokens, node.arguments, options.CallExpression.arguments);
            } else {
                addElementListIndent(tokens, node.arguments, 1);
                node.arguments.forEach(arg => ignoreToken(sourceCode.getFirstToken(arg)));
            }
        }

        /**
        * Checks the indentation of ClassDeclarations and ClassExpressions
        * @param {ASTNode} node A ClassDeclaration or ClassExpression node
        * @returns {void}
        */
        function addClassIndent(node) {
            const tokens = getTokensAndComments(node);

            setDesiredOffsets(tokens.slice(1, -1), tokens[0], 1);
            matchIndentOf(tokens[0], tokens[tokens.length - 1]);
        }

        /**
        * Checks the indentation of parenthesized values, given a list of tokens in a program
        * @param {Token[]} tokens A list of tokens
        * @returns {void}
        */
        function addParensIndent(tokens) {
            const parenStack = [];
            const parenPairs = [];

            tokens.forEach(nextToken => {

                // Accumulate a list of parenthesis pairs
                if (nextToken.type === "Punctuator" && nextToken.value === "(") {
                    parenStack.push(nextToken);
                } else if (nextToken.type === "Punctuator" && nextToken.value === ")") {
                    parenPairs.unshift({ left: parenStack.pop(), right: nextToken });
                }
            });

            parenPairs.forEach(pair => {
                const leftParen = pair.left;
                const rightParen = pair.right;

                // We only want to handle parens around expressions, so exclude parentheses that are in function parameters and function call arguments.
                if (!parameterParens.has(leftParen) && !parameterParens.has(rightParen)) {
                    const leftParenIndex = lodash.sortedIndexBy(tokens, leftParen, token => token.range[0]);
                    const rightParenIndex = lodash.sortedIndexBy(tokens, rightParen, token => token.range[0]);
                    const parensAndTokens = tokens.slice(leftParenIndex, rightParenIndex + 1);
                    const parenthesizedTokens = new WeakSet(parensAndTokens.slice(1, -1));

                    // Iterate through all of the parenthesized tokens, and set an offset from the opening paren.
                    parensAndTokens.slice(1, -1).forEach(token => {

                        /*
                         * However, only change the offset of a token if its initial offset was from a token outside of the parens.
                         * For example, if the parentheses contain a complex expression, don't overwrite the relationships
                         * between the parenthesized tokens.
                         */
                        if (!parenthesizedTokens.has(desiredOffsets.get(token).from)) {
                            setDesiredOffset(token, leftParen, 1);
                        }
                    });
                }

                matchIndentOf(leftParen, rightParen);
            });
        }

        return {
            ArrayExpression: addArrayOrObjectIndent,
            ArrayPattern: addArrayOrObjectIndent,

            ArrowFunctionExpression(node) {
                addFunctionParamsIndent(node, options.FunctionExpression.parameters);
                if (node.body.type !== "BlockStatement") {
                    setDesiredOffsets(getTokensAndComments(node.body), sourceCode.getFirstToken(node), 1);
                }
            },

            AssignmentExpression(node) {
                const operator = sourceCode.getTokensBetween(node.left, node.right).find(token => token.value === node.operator);
                const nodeTokens = getTokensAndComments(node);
                const tokensFromOperator = nodeTokens.slice(lodash.sortedIndexBy(nodeTokens, operator, token => token.range[0]));

                setDesiredOffsets(tokensFromOperator, sourceCode.getFirstToken(node.left), 1);
                ignoreToken(tokensFromOperator[0]);
                ignoreToken(tokensFromOperator[1]);
            },

            BinaryExpression: addBinaryOrLogicalExpressionIndent,

            BlockStatement: addBlockIndent,

            CallExpression: addFunctionCallIndent,

            ClassDeclaration: addClassIndent,

            ClassExpression: addClassIndent,

            ConditionalExpression(node) {
                const tokens = getTokensAndComments(node);

                setDesiredOffsets(tokens.slice(1), tokens[0], 1);
            },

            DoWhileStatement: node => addBlocklessNodeIndent(node.body, node),

            ExportNamedDeclaration(node) {
                if (node.declaration === null) {
                    addElementListIndent(getTokensAndComments(node).slice(1), node.specifiers, 1);
                }
            },

            ForInStatement: node => addBlocklessNodeIndent(node.body, node),

            ForOfStatement: node => addBlocklessNodeIndent(node.body, node),

            ForStatement(node) {
                const forOpeningParen = sourceCode.getFirstToken(node, 1);

                if (node.init) {
                    setDesiredOffsets(getTokensAndComments(node.init), forOpeningParen, 1);
                }
                if (node.test) {
                    setDesiredOffsets(getTokensAndComments(node.test), forOpeningParen, 1);
                }
                if (node.update) {
                    setDesiredOffsets(getTokensAndComments(node.update), forOpeningParen, 1);
                }
                addBlocklessNodeIndent(node.body, node);
            },

            FunctionDeclaration(node) {
                addFunctionParamsIndent(node, options.FunctionDeclaration.parameters);
            },

            FunctionExpression(node) {
                addFunctionParamsIndent(node, options.FunctionExpression.parameters);
            },

            IfStatement: addIfStatementIndent,

            ImportDeclaration(node) {
                if (node.specifiers.filter(specifier => specifier.type === "ImportSpecifier").length) {
                    const allTokens = getTokensAndComments(node);
                    const openingCurlyIndex = allTokens.findIndex(token => token.value === "{");
                    const closingCurlyIndex = lodash.findLastIndex(allTokens, token => token.value === "}");
                    const specifierTokens = allTokens.slice(openingCurlyIndex, closingCurlyIndex + 1);

                    addElementListIndent(specifierTokens, node.specifiers.filter(specifier => specifier.type === "ImportSpecifier"), 1);
                }
            },

            LogicalExpression: addBinaryOrLogicalExpressionIndent,

            MemberExpression(node) {
                const tokens = getTokensAndComments(node);
                const firstNonObjectToken = sourceCode.getTokensBetween(node.object, node.property).find(token => token.value !== ")");
                const tokensToIndent = tokens.slice(lodash.sortedIndexBy(tokens, firstNonObjectToken, token => token.range[0]));

                setDesiredOffsets(tokensToIndent.slice(1), tokensToIndent[0], 0);

                if (typeof options.MemberExpression === "number") {
                    setDesiredOffset(tokensToIndent[0], sourceCode.getFirstToken(node.object), options.MemberExpression);
                    setDesiredOffset(tokensToIndent[1], sourceCode.getFirstToken(node.object), options.MemberExpression);
                } else {
                    matchIndentOf(getFirstTokenOfLine(tokensToIndent[0]), tokensToIndent[0]);
                    matchIndentOf(getFirstTokenOfLine(tokensToIndent[1]), tokensToIndent[1]);
                    ignoreToken(tokensToIndent[0]);
                    ignoreToken(tokensToIndent[1]);
                }
            },

            NewExpression(node) {

                // Only indent the arguments if the NewExpression has parens (e.g. `new Foo(bar)` or `new Foo()`, but not `new Foo`
                if (node.arguments.length > 0 || sourceCode.getLastToken(node).value === ")" && sourceCode.getLastToken(node, 1).value === "(") {
                    addFunctionCallIndent(node);
                }
            },

            ObjectExpression: addArrayOrObjectIndent,
            ObjectPattern: addArrayOrObjectIndent,

            Property(node) {
                if (!node.computed && !node.shorthand && !node.method && node.kind === "init") {
                    const colon = sourceCode.getTokensBetween(node.key, node.value).find(token => token.value === ":");

                    ignoreToken(sourceCode.getTokenAfter(colon));
                }
            },

            SwitchStatement(node) {
                const tokens = getTokensAndComments(node);
                const openingCurlyIndex = tokens.findIndex(token => token.range[0] >= node.discriminant.range[1] && token.value === "{");

                setDesiredOffsets(tokens.slice(openingCurlyIndex + 1, -1), tokens[openingCurlyIndex], options.SwitchCase);

                const caseKeywords = new WeakSet(node.cases.map(switchCase => sourceCode.getFirstToken(switchCase)));
                const lastCaseKeyword = node.cases.length && sourceCode.getFirstToken(node.cases[node.cases.length - 1]);
                const casesWithBlocks = new WeakSet(
                    node.cases
                        .filter(switchCase => switchCase.consequent.length === 1 && switchCase.consequent[0].type === "BlockStatement")
                        .map(switchCase => sourceCode.getFirstToken(switchCase))
                );
                let lastAnchor = tokens[openingCurlyIndex];

                tokens.slice(openingCurlyIndex + 1, -1).forEach(token => {
                    if (caseKeywords.has(token)) {
                        lastAnchor = token;
                    } else if (lastAnchor === lastCaseKeyword && (token.type === "Line" || token.type === "Block")) {
                        ignoreToken(token);
                    } else if (!casesWithBlocks.has(lastAnchor)) {
                        setDesiredOffset(token, lastAnchor, 1);
                    }
                });
            },

            TemplateLiteral(node) {
                const tokens = getTokensAndComments(node);

                setDesiredOffsets(getTokensAndComments(node.quasis[0]), tokens[0], 0);
                node.expressions.forEach((expression, index) => {
                    const previousQuasi = node.quasis[index];
                    const nextQuasi = node.quasis[index + 1];
                    const tokenToAlignFrom = previousQuasi.loc.start.line === previousQuasi.loc.end.line ? sourceCode.getFirstToken(previousQuasi) : null;

                    setDesiredOffsets(sourceCode.getTokensBetween(previousQuasi, nextQuasi), tokenToAlignFrom, 1);
                    setDesiredOffset(sourceCode.getFirstToken(nextQuasi), tokenToAlignFrom, 0);
                });
            },

            VariableDeclaration(node) {
                setDesiredOffsets(getTokensAndComments(node).slice(1), sourceCode.getFirstToken(node), options.VariableDeclarator[node.kind]);
                const lastToken = sourceCode.getLastToken(node);

                if (lastToken.type === "Punctuator" && lastToken.value === ";") {
                    ignoreToken(lastToken);
                }
            },

            VariableDeclarator(node) {
                if (node.init) {
                    ignoreToken(sourceCode.getFirstToken(node.init));
                }
            },

            "VariableDeclarator:exit"(node) {

                /*
                 * VariableDeclarator indentation is a bit different from other forms of indentation, in that the
                 * indentation of an opening bracket sometimes won't match that of a closing bracket. For example,
                 * the following indentations are correct:
                 *
                 * var foo = {
                 *   ok: true
                 * };
                 *
                 * var foo = {
                 *     ok: true,
                 *   },
                 *   bar = 1;
                 *
                 * Account for when exiting the AST (after indentations have already been set for the nodes in
                 * the declaration) by manually increasing the indentation level of the tokens in the first declarator if the
                 * parent declaration has more than one declarator.
                 */
                if (node.parent.declarations.length > 1 && node.parent.declarations[0] === node && node.init) {
                    const valueTokens = new Set(getTokensAndComments(node.init));

                    valueTokens.forEach(token => {
                        const tokenOffset = desiredOffsets.get(token);

                        if (!valueTokens.has(tokenOffset.from)) {
                            desiredOffsets.set(token, { offset: tokenOffset.offset + options.VariableDeclarator[node.parent.kind], from: tokenOffset.from });
                        }
                    });
                }
            },

            WhileStatement: node => addBlocklessNodeIndent(node.body, node),

            "Program:exit"() {
                addParensIndent(sourceCode.tokensAndComments);
                sourceCode.ast.tokens.forEach(token => {
                    const tokenIndent = getDesiredIndent(token);

                    if (token === getFirstTokenOfLine(token) && !validateTokenIndent(token, tokenIndent)) {
                        report(token, tokenIndent);
                    }
                });

                /*
                 * Create a Map from (tokenOrComment) => (precedingToken).
                 * This is necessary because sourceCode.getTokenBefore does not handle a comment as an argument correctly.
                 */
                const precedingTokens = new WeakMap();

                sourceCode.tokensAndComments.reduce((latestToken, tokenOrComment) => {
                    if (tokenOrComment.type === "Line" || tokenOrComment.type === "Block") {
                        precedingTokens.set(tokenOrComment, latestToken);
                        return latestToken;
                    }
                    return tokenOrComment;
                }, null);

                /*
                 * TODO: (not-an-aardvark) Clean this part up, I think it's more complicated than it needs to be.
                 * Basically, each comment can either have (a) the indentation that was calculated as if it was a token,
                 * (b) the same indentation as the token before it, or (c) the same indentation as the token after it.
                 */
                sourceCode.ast.comments.forEach(comment => {
                    const isFirstInLine = !sourceCode.getText().slice(comment.range[0] - comment.loc.start.column, comment.range[0]).trim();
                    const tokenBefore = precedingTokens.get(comment) && getFirstTokenOfLine(precedingTokens.get(comment));
                    const immediateTokenAfter = tokenBefore ? sourceCode.getTokenAfter(precedingTokens.get(comment)) : sourceCode.ast.tokens[0];
                    const tokenAfter = immediateTokenAfter && getFirstTokenOfLine(immediateTokenAfter);
                    const matchesTokenBeforeIndent = tokenBefore && validateTokenIndent(comment, getDesiredIndent(tokenBefore));
                    const matchesTokenAfterIndent = tokenAfter && validateTokenIndent(comment, getDesiredIndent(tokenAfter));
                    const matchesNoTokensIndent = validateTokenIndent(comment, getDesiredIndent(comment));

                    if (isFirstInLine && !matchesTokenBeforeIndent && !matchesTokenAfterIndent && !matchesNoTokensIndent) {
                        report(comment, getDesiredIndent(comment));
                    }
                });
            }

        };

    }
};
