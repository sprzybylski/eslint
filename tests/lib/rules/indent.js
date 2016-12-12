/**
 * @fileoverview This option sets a specific tab width for your code
 * @author Dmitriy Shekhovtsov
 * @author Gyandeep Singh
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/indent"),
    RuleTester = require("../../../lib/testers/rule-tester");
const fs = require("fs");
const path = require("path");

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const fixture = fs.readFileSync(path.join(__dirname, "../../fixtures/rules/indent/indent-invalid-fixture-1.js"), "utf8");
const fixedFixture = fs.readFileSync(path.join(__dirname, "../../fixtures/rules/indent/indent-valid-fixture-1.js"), "utf8");

/**
 * Create error message object for failure cases with a single 'found' indentation type
 * @param {string} indentType indent type of string or tab
 * @param {array} errors error info
 * @returns {Object} returns the error messages collection
 * @private
 */
function expectedErrors(indentType, errors) {
    if (Array.isArray(indentType)) {
        errors = indentType;
        indentType = "space";
    }

    if (!errors[0].length) {
        errors = [errors];
    }

    return errors.map(err => {
        let message;

        if (typeof err[1] === "string" && typeof err[2] === "string") {
            message = `Expected indentation of ${err[1]} but found ${err[2]}.`;
        } else {
            const chars = indentType + (err[1] === 1 ? "" : "s");

            message = `Expected indentation of ${err[1]} ${chars} but found ${err[2]}.`;
        }
        return { message, type: err[3], line: err[0] };
    });
}

const ruleTester = new RuleTester();

ruleTester.run("indent", rule, {
    valid: [
        {
            code: `\
bridge.callHandler(
  'getAppVersion', 'test23', function(responseData) {
    window.ah.mobileAppVersion = responseData;
  }
);`,
            options: [2]
        },
        {
            code: `\
bridge.callHandler(
  'getAppVersion', 'test23', function(responseData) {
    window.ah.mobileAppVersion = responseData;
  });`,
            options: [2]
        },
        {
            code: `\
bridge.callHandler(
  'getAppVersion',
  null,
  function responseCallback(responseData) {
    window.ah.mobileAppVersion = responseData;
  }
);`,
            options: [2]
        },
        {
            code: `\
bridge.callHandler(
  'getAppVersion',
  null,
  function responseCallback(responseData) {
    window.ah.mobileAppVersion = responseData;
  });`,
            options: [2]
        },
        {
            code: `\
function doStuff(keys) {
    _.forEach(
        keys,
        key => {
            doSomething(key);
        }
    );
}`,
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
example(
    function () {
        console.log('example');
    }
);`,
            options: [4]
        },
        {
            code: `\
let foo = somethingList
    .filter(x => {
        return x;
    })
    .map(x => {
        return 100 * x;
    });`,
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
var x = 0 &&
    {
        a: 1,
        b: 2
    };`,
            options: [4]
        },
        {
            code: `\
var x = 0 &&
\t{
\t\ta: 1,
\t\tb: 2
\t};`,
            options: ["tab"]
        },
        {
            code: `\
var x = 0 &&
    {
        a: 1,
        b: 2
    }||
    {
        c: 3,
        d: 4
    };`,
            options: [4]
        },
        {
            code: `\
var x = [
    'a',
    'b',
    'c'
];`,
            options: [4]
        },
        {
            code: `\
var x = ['a',
    'b',
    'c',
];`,
            options: [4]
        },
        {
            code: "var x = 0 && 1;",
            options: [4]
        },
        {
            code: "var x = 0 && { a: 1, b: 2 };",
            options: [4]
        },
        {
            code: `\
var x = 0 &&
    (
        1
    );`,
            options: [4]
        },
        {
            code: "var x = 0 && { a: 1, b: 2 };",
            options: [4]
        },
        {
            code: `\
require('http').request({hostname: 'localhost',
  port: 80}, function(res) {
  res.end();
});`,
            options: [2]
        },
        {
            code: `\
function test() {
  return client.signUp(email, PASSWORD, { preVerified: true })
    .then(function (result) {
      // hi
    })
    .then(function () {
      return FunctionalHelpers.clearBrowserState(self, {
        contentServer: true,
        contentServer1: true
      });
    });
}`,
            options: [2]
        },
        {
            code: `\
it('should... some lengthy test description that is forced to be' +
  'wrapped into two lines since the line length limit is set', () => {
  expect(true).toBe(true);
});`,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
function test() {
    return client.signUp(email, PASSWORD, { preVerified: true })
        .then(function (result) {
            var x = 1;
            var y = 1;
        }, function(err){
            var o = 1 - 2;
            var y = 1 - 2;
            return true;
        })
}`,
            options: [4]
        },
        {
            code: `\
function test() {
    return client.signUp(email, PASSWORD, { preVerified: true })
    .then(function (result) {
        var x = 1;
        var y = 1;
    }, function(err){
        var o = 1 - 2;
        var y = 1 - 2;
        return true;
    });
}`,
            options: [4, { MemberExpression: 0 }]
        },

        {
            code: "// hi",
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var Command = function() {
  var fileList = [],
      files = []

  files.concat(fileList)
};`,
            options: [2, { VariableDeclarator: { var: 2, let: 2, const: 3 } }]
        },
        {
            code: "  ",
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
if(data) {
  console.log('hi');
  b = true;};`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
foo = () => {
  console.log('hi');
  return true;};`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
function test(data) {
  console.log('hi');
  return true;};`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var test = function(data) {
  console.log('hi');
};`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
arr.forEach(function(data) {
  otherdata.forEach(function(zero) {
    console.log('hi');
  }) });`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
a = [
    ,3
]`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
[
  ['gzip', 'gunzip'],
  ['gzip', 'unzip'],
  ['deflate', 'inflate'],
  ['deflateRaw', 'inflateRaw'],
].forEach(function(method) {
  console.log(method);
});`,
            options: [2, { SwitchCase: 1, VariableDeclarator: 2 }]
        },
        {
            code: `\
test(123, {
    bye: {
        hi: [1,
            {
                b: 2
            }
        ]
    }
});`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var xyz = 2,
    lmn = [
        {
            a: 1
        }
    ];`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
lmnn = [{
    a: 1
},
{
    b: 2
}, {
    x: 2
}];`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
[{
    foo: 1
}, {
    foo: 2
}, {
    foo: 3
}]`
        },
        {
            code: `\
foo([
    bar
], [
    baz
], [
    qux
]);`
        },
        {
            code: `\
abc({
    test: [
        [
            c,
            xyz,
            2
        ].join(',')
    ]
});`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
abc = {
  test: [
    [
      c,
      xyz,
      2
    ]
  ]
};`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
abc(
  {
    a: 1,
    b: 2
  }
);`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
abc({
    a: 1,
    b: 2
});`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var abc =
  [
    c,
    xyz,
    {
      a: 1,
      b: 2
    }
  ];`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var abc = [
  c,
  xyz,
  {
    a: 1,
    b: 2
  }
];`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var abc = 5,
    c = 2,
    xyz =
    {
      a: 1,
      b: 2
    };`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
var foo = 1,
  bar =
    2`,
            options: [2, { VariableDeclarator: 1 }]
        },
        {
            code: `\
var foo = 1,
    bar = 2,
    baz = 3
;`,
            options: [2, { VariableDeclarator: { var: 2 } }]
        },
        {
            code: `\
var foo = 1,
    bar = 2,
    baz = 3
    ;`,
            options: [2, { VariableDeclarator: { var: 2 } }]
        },
        {
            code: `\
var abc =
    {
      a: 1,
      b: 2
    };`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
var a = new abc({
        a: 1,
        b: 2
    }),
    b = 2;`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var a = 2,
  c = {
    a: 1,
    b: 2
  },
  b = 2;`,
            options: [2, { VariableDeclarator: 1, SwitchCase: 1 }]
        },
        {
            code: `\
var x = 2,
    y = {
      a: 1,
      b: 2
    },
    b = 2;`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
var e = {
      a: 1,
      b: 2
    },
    b = 2;`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
var a = {
  a: 1,
  b: 2
};`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
function test() {
  if (true ||
            false){
    console.log(val);
  }
}`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
var foo = bar ||
    !(
        baz
    );`
        },
        {
            code: `\
for (var foo = 1;
    foo < 10;
    foo++) {}`,
        },
        {
            code: `\
for (
    var foo = 1;
    foo < 10;
    foo++
) {}`
        },
        {
            code: `\
for (var val in obj)
  if (true)
    console.log(val);`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
if(true)
  if (true)
    if (true)
      console.log(val);`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
function hi(){     var a = 1;
  y++;                   x++;
}`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
for(;length > index; index++)if(NO_HOLES || index in self){
  x++;
}`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
function test(){
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
  }
}`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }]
        },
        {
            code: `\
var geometry = 2,
rotate = 2;`,
            options: [2, { VariableDeclarator: 0 }]
        },
        {
            code: `\
var geometry,
    rotate;`,
            options: [4, { VariableDeclarator: 1 }]
        },
        {
            code: `\
var geometry,
\trotate;`,
            options: ["tab", { VariableDeclarator: 1 }]
        },
        {
            code: `\
var geometry,
  rotate;`,
            options: [2, { VariableDeclarator: 1 }]
        },
        {
            code: `\
var geometry,
    rotate;`,
            options: [2, { VariableDeclarator: 2 }]
        },
        {
            code: `\
let geometry,
    rotate;`,
            options: [2, { VariableDeclarator: 2 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
const geometry = 2,
    rotate = 3;`,
            options: [2, { VariableDeclarator: 2 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,
  height, rotate;`,
            options: [2, { SwitchCase: 1 }]
        },
        {
            code: "var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth;",
            options: [2, { SwitchCase: 1 }]
        },
        {
            code: `\
if (1 < 2){
//hi sd
}`,
            options: [2]
        },
        {
            code: `\
while (1 < 2){
  //hi sd
}`,
            options: [2]
        },
        {
            code: "while (1 < 2) console.log('hi');",
            options: [2]
        },

        {
            code: `\
[a, boop,
    c].forEach((index) => {
        index;
    });`,
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
[a, b,
    c].forEach(function(index){
        return index;
    });`,
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
[a, b, c].forEach((index) => {
    index;
});`,
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
[a, b, c].forEach(function(index){
    return index;
});`,
            options: [4],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
(foo)
    .bar([
        baz
    ]);`,
            options: [4, { MemberExpression: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
switch (x) {
    case "foo":
        a();
        break;
    case "bar":
        switch (y) {
            case "1":
                break;
            case "2":
                a = 6;
                break;
        }
    case "test":
        break;
}`,
            options: [4, { SwitchCase: 1 }]
        },
        {
            code: `\
switch (x) {
        case "foo":
            a();
            break;
        case "bar":
            switch (y) {
                    case "1":
                        break;
                    case "2":
                        a = 6;
                        break;
            }
        case "test":
            break;
}`,
            options: [4, { SwitchCase: 2 }]
        },
        {
            code: `\
switch (a) {
case "foo":
    a();
    break;
case "bar":
    switch(x){
    case '1':
        break;
    case '2':
        a = 6;
        break;
    }
}`
        },
        {
            code: `\
switch (a) {
case "foo":
    a();
    break;
case "bar":
    if(x){
        a = 2;
    }
    else{
        a = 6;
    }
}`
        },
        {
            code: `\
switch (a) {
case "foo":
    a();
    break;
case "bar":
    if(x){
        a = 2;
    }
    else
        a = 6;
}`
        },
        {
            code: `\
switch (a) {
case "foo":
    a();
    break;
case "bar":
    a(); break;
case "baz":
    a(); break;
}`
        },
        {
            code: `\
switch (0) {
}`
        },
        {
            code: `\
function foo() {
    var a = "a";
    switch(a) {
    case "a":
        return "A";
    case "b":
        return "B";
    }
}
foo();`
        },
        {
            code: `\
switch(value){
    case "1":
    case "2":
        a();
        break;
    default:
        a();
        break;
}
switch(value){
    case "1":
        a();
        break;
    case "2":
        break;
    default:
        break;
}`,
            options: [4, { SwitchCase: 1 }]
        },
        {
            code: `\
var obj = {foo: 1, bar: 2};
with (obj) {
    console.log(foo + bar);
}`
        },
        {
            code: `\
if (a) {
    (1 + 2 + 3); // no error on this line
}`
        },
        {
            code: "switch(value){ default: a(); break; }"
        },
        {
            code: `\
import {addons} from 'react/addons'
import React from 'react'`,
            options: [2],
            parserOptions: { sourceType: "module" }
        },
        {
            code: `\
import {
    foo,
    bar,
    baz
} from 'qux';`,
            parserOptions: { sourceType: "module" }
        },
        {
            code: `\
var a = 1,
    b = 2,
    c = 3;`,
            options: [4]
        },
        {
            code: `\
var a = 1
    ,b = 2
    ,c = 3;`,
            options: [4]
        },
        {
            code: "while (1 < 2) console.log('hi')",
            options: [2]
        },
        {
            code: `\
function salutation () {
  switch (1) {
    case 0: return console.log('hi')
    case 1: return console.log('hey')
  }
}`,
            options: [2, { SwitchCase: 1 }]
        },
        {
            code: `\
var items = [
  {
    foo: 'bar'
  }
];`,
            options: [2, { VariableDeclarator: 2 }]
        },
        {
            code: `\
const a = 1,
      b = 2;
const items1 = [
  {
    foo: 'bar'
  }
];
const items2 = Items(
  {
    foo: 'bar'
  }
);`,
            options: [2, { VariableDeclarator: 3 }],
            parserOptions: { ecmaVersion: 6 }

        },
        {
            code: `\
const geometry = 2,
      rotate = 3;
var a = 1,
  b = 2;
let light = true,
    shadow = false;`,
            options: [2, { VariableDeclarator: { const: 3, let: 2 } }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
const abc = 5,
      c = 2,
      xyz =
      {
        a: 1,
        b: 2
      };
let abc = 5,
  c = 2,
  xyz =
  {
    a: 1,
    b: 2
  };
var abc = 5,
    c = 2,
    xyz =
    {
      a: 1,
      b: 2
    };`,
            options: [2, { VariableDeclarator: { var: 2, const: 3 }, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
module.exports = {
  'Unit tests':
  {
    rootPath: './',
    environment: 'node',
    tests:
    [
      'test/test-*.js'
    ],
    sources:
    [
      '*.js',
      'test/**.js'
    ]
  }
};`,
            options: [2]
        },
        {
            code: `\
foo =
  bar;`,
            options: [2]
        },
        {
            code: `\
foo = (
  bar
);`,
            options: [2]
        },
        {
            code: `\
var path     = require('path')
  , crypto    = require('crypto')
  ;`,
            options: [2]
        },
        {
            code: `\
var a = 1
    ,b = 2
    ;`
        },
        {
            code: `\
export function create (some,
                        argument) {
  return Object.create({
    a: some,
    b: argument
  });
};`,
            parserOptions: { sourceType: "module" },
            options: [2]
        },
        {
            code: `\
export function create (id, xfilter, rawType,
                        width=defaultWidth, height=defaultHeight,
                        footerHeight=defaultFooterHeight,
                        padding=defaultPadding) {
  // ... function body, indented two spaces
}`,
            parserOptions: { sourceType: "module" },
            options: [2]
        },
        {
            code: `\
var obj = {
  foo: function () {
    return new p()
      .then(function (ok) {
        return ok;
      }, function () {
        // ignore things
      });
  }
};`,
            options: [2]
        },
        {
            code: `\
a.b()
  .c(function(){
    var a;
  }).d.e;`,
            options: [2]
        },
        {
            code: `\
const YO = 'bah',
      TE = 'mah'

var res,
    a = 5,
    b = 4`,
            parserOptions: { ecmaVersion: 6 },
            options: [2, { VariableDeclarator: { var: 2, let: 2, const: 3 } }]
        },
        {
            code: `\
const YO = 'bah',
      TE = 'mah'

var res,
    a = 5,
    b = 4

if (YO) console.log(TE)`,
            parserOptions: { ecmaVersion: 6 },
            options: [2, { VariableDeclarator: { var: 2, let: 2, const: 3 } }]
        },
        {
            code: `\
var foo = 'foo',
  bar = 'bar',
  baz = function() {

  }

function hello () {

}`,
            options: [2]
        },
        {
            code: `\
var obj = {
  send: function () {
    return P.resolve({
      type: 'POST'
    })
      .then(function () {
        return true;
      }, function () {
        return false;
      });
  }
};`,
            options: [2]
        },
        {
            code: `\
var obj = {
  send: function () {
    return P.resolve({
      type: 'POST'
    })
    .then(function () {
      return true;
    }, function () {
      return false;
    });
  }
};`,
            options: [2, { MemberExpression: 0 }]
        },
        {
            code: `\
const someOtherFunction = argument => {
        console.log(argument);
    },
    someOtherValue = 'someOtherValue';`,
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
[
  'a',
  'b'
].sort().should.deepEqual([
  'x',
  'y'
]);`,
            options: [2]
        },
        {
            code: `\
var a = 1,
    B = class {
      constructor(){}
      a(){}
      get b(){}
    };`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
var a = 1,
    B =
    class {
      constructor(){}
      a(){}
      get b(){}
    },
    c = 3;`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
class A{
    constructor(){}
    a(){}
    get b(){}
}`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
var A = class {
    constructor(){}
    a(){}
    get b(){}
}`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
var a = {
  some: 1
  , name: 2
};`,
            options: [2]
        },
        {
            code: `\
a.c = {
    aa: function() {
        'test1';
        return 'aa';
    }
    , bb: function() {
        return this.bb();
    }
};`,
            options: [4]
        },
        {
            code: `\
var a =
{
    actions:
    [
        {
            name: 'compile'
        }
    ]
};`,
            options: [4, { VariableDeclarator: 0, SwitchCase: 1 }]
        },
        {
            code: `\
var a =
[
    {
        name: 'compile'
    }
];`,
            options: [4, { VariableDeclarator: 0, SwitchCase: 1 }]
        },
        {
            code: `\
const func = function (opts) {
    return Promise.resolve()
    .then(() => {
        [
            'ONE', 'TWO'
        ].forEach(command => { doSomething(); });
    });
};`,
            parserOptions: { ecmaVersion: 6 },
            options: [4, { MemberExpression: 0 }]
        },
        {
            code: `\
const func = function (opts) {
    return Promise.resolve()
        .then(() => {
            [
                'ONE', 'TWO'
            ].forEach(command => { doSomething(); });
        });
};`,
            parserOptions: { ecmaVersion: 6 },
            options: [4]
        },
        {
            code: `\
var haveFun = function () {
    SillyFunction(
        {
            value: true,
        },
        {
            _id: true,
        }
    );
};`,
            options: [4]
        },
        {
            code: `\
var haveFun = function () {
    new SillyFunction(
        {
            value: true,
        },
        {
            _id: true,
        }
    );
};`,
            options: [4]
        },
        {
            code: `\
let object1 = {
  doThing() {
    return _.chain([])
      .map(v => (
        {
          value: true,
        }
      ))
      .value();
  }
};`,
            parserOptions: { ecmaVersion: 6 },
            options: [2]
        },
        {
            code: `\
var foo = {
    bar: 1,
    baz: {
      qux: 2
    }
  },
  bar = 1;`,
            options: [2]
        },
        {
            code: `\
class Foo
  extends Bar {
  baz() {}
}`,
            parserOptions: { ecmaVersion: 6 },
            options: [2]
        },
        {
            code: `\
class Foo extends
  Bar {
  baz() {}
}`,
            parserOptions: { ecmaVersion: 6 },
            options: [2]
        },
        {
            code: `\
fs.readdirSync(path.join(__dirname, '../rules')).forEach(name => {
  files[name] = foo;
});`,
            options: [2, { outerIIFEBody: 0 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
(function(){
function foo(x) {
  return x + 1;
}
})();`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
(function(){
        function foo(x) {
            return x + 1;
        }
})();`,
            options: [4, { outerIIFEBody: 2 }]
        },
        {
            code: `\
(function(x, y){
function foo(x) {
  return x + 1;
}
})(1, 2);`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
(function(){
function foo(x) {
  return x + 1;
}
}());`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
!function(){
function foo(x) {
  return x + 1;
}
}();`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
!function(){
\t\t\tfunction foo(x) {
\t\t\t\treturn x + 1;
\t\t\t}
}();`,
            options: ["tab", { outerIIFEBody: 3 }]
        },
        {
            code: `\
var out = function(){
  function fooVar(x) {
    return x + 1;
  }
};`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
var ns = function(){
function fooVar(x) {
  return x + 1;
}
}();`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
ns = function(){
function fooVar(x) {
  return x + 1;
}
}();`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
var ns = (function(){
function fooVar(x) {
  return x + 1;
}
}(x));`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
var ns = (function(){
        function fooVar(x) {
            return x + 1;
        }
}(x));`,
            options: [4, { outerIIFEBody: 2 }]
        },
        {
            code: `\
var obj = {
  foo: function() {
    return true;
  }
};`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
while (
  function() {
    return true;
  }()) {

  x = x + 1;
};`,
            options: [2, { outerIIFEBody: 20 }]
        },
        {
            code: `\
(() => {
function foo(x) {
  return x + 1;
}
})();`,
            parserOptions: { ecmaVersion: 6 },
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
function foo() {
}`,
            options: ["tab", { outerIIFEBody: 0 }]
        },
        {
            code: `\
;(() => {
function foo(x) {
  return x + 1;
}
})();`,
            parserOptions: { ecmaVersion: 6 },
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: `\
if(data) {
  console.log('hi');
}`,
            options: [2, { outerIIFEBody: 0 }]
        },
        {
            code: "Buffer.length",
            options: [4, { MemberExpression: 1 }]
        },
        {
            code: `\
Buffer
    .indexOf('a')
    .toString()`,
            options: [4, { MemberExpression: 1 }]
        },
        {
            code: `\
Buffer.
    length`,
            options: [4, { MemberExpression: 1 }]
        },
        {
            code: `\
Buffer
    .foo
    .bar`,
            options: [4, { MemberExpression: 1 }]
        },
        {
            code: `\
Buffer
\t.foo
\t.bar`,
            options: ["tab", { MemberExpression: 1 }]
        },
        {
            code: `\
Buffer
    .foo
    .bar`,
            options: [2, { MemberExpression: 2 }]
        },
        {
            code: `\
MemberExpression
.is
  .off
    .by
 .default();`,
            options: [4]
        },
        {
            code: `\
foo = bar.baz()
    .bip();`,
            options: [4, { MemberExpression: 1 }]
        },
        {
            code: `\
if (foo) {
  bar();
} else if (baz) {
  foobar();
} else if (qux) {
  qux();
}`,
            options: [2]
        },
        {
            code: `\
function foo(aaa,
  bbb, ccc, ddd) {
    bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: 1, body: 2 } }]
        },
        {
            code: `\
function foo(aaa, bbb,
      ccc, ddd) {
  bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: 3, body: 1 } }]
        },
        {
            code: `\
function foo(aaa,
    bbb,
    ccc) {
            bar();
}`,
            options: [4, { FunctionDeclaration: { parameters: 1, body: 3 } }]
        },
        {
            code: `\
function foo(aaa,
             bbb, ccc,
             ddd, eee, fff) {
  bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: "first", body: 1 } }]
        },
        {
            code: `\
function foo(aaa, bbb)
{
      bar();
}`,
            options: [2, { FunctionDeclaration: { body: 3 } }]
        },
        {
            code: `\
function foo(
  aaa,
  bbb) {
    bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: "first", body: 2 } }]
        },
        {
            code: `\
var foo = function(aaa,
    bbb,
    ccc,
    ddd) {
bar();
}`,
            options: [2, { FunctionExpression: { parameters: 2, body: 0 } }]
        },
        {
            code: `\
var foo = function(aaa,
  bbb,
  ccc) {
                    bar();
}`,
            options: [2, { FunctionExpression: { parameters: 1, body: 10 } }]
        },
        {
            code: `\
var foo = function(aaa,
                   bbb, ccc, ddd,
                   eee, fff) {
    bar();
}`,
            options: [4, { FunctionExpression: { parameters: "first", body: 1 } }]
        },
        {
            code: `\
var foo = function(
  aaa, bbb, ccc,
  ddd, eee) {
      bar();
}`,
            options: [2, { FunctionExpression: { parameters: "first", body: 3 } }]
        },
        {
            code: `\
foo.bar(
      baz, qux, function() {
            qux;
      }
);`,
            options: [2, { FunctionExpression: { body: 3 } }]
        },
        {
            code: `\
function foo() {
  bar();
  \tbaz();
\t   \t\t\t  \t\t\t  \t   \tqux();
}`,
            options: [2]
        },
        {
            code: `\
function foo() {
  function bar() {
    baz();
  }
}`,
            options: [2, { FunctionDeclaration: { body: 1 } }]
        },
        {
            code: `\
function foo() {
  bar();
   \t\t}`,
            options: [2]
        },
        {
            code: `\
function foo() {
  function bar(baz,
      qux) {
    foobar();
  }
}`,
            options: [2, { FunctionDeclaration: { body: 1, parameters: 2 } }]
        },
        {
            code: `\
((
    foo
))`,
            options: [4]
        },

        // ternary expressions (https://github.com/eslint/eslint/issues/7420)
        {
            code: `\
foo
  ? bar
  : baz`,
            options: [2]
        },
        {
            code: `\
foo = (bar ?
  baz :
  qux
);`,
            options: [2]
        },
        {
            code: `\
[
    foo ?
        bar :
        baz,
    qux
];`
        },
        {

            // Checking comments:
            // https://github.com/eslint/eslint/issues/3845, https://github.com/eslint/eslint/issues/6571
            code: `\
foo();
// Line
/* multiline
  Line */
bar();
// trailing comment`,
            options: [2]
        },
        {
            code: `\
switch (foo) {
  case bar:
    baz();
    // call the baz function
}`,
            options: [2, { SwitchCase: 1 }]
        },
        {
            code: `\
switch (foo) {
  case bar:
    baz();
  // no default
}`,
            options: [2, { SwitchCase: 1 }]
        },
        {
            code: `\
[
    // no elements
]`
        },
        {

            // Destructuring assignments:
            // https://github.com/eslint/eslint/issues/6813
            code: `\
var {
  foo,
  bar,
  baz: qux,
  foobar: baz = foobar
} = qux;`,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
var [
  foo,
  bar,
  baz,
  foobar = baz
] = qux;`,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {

            // https://github.com/eslint/eslint/issues/7233
            code: `\
var folder = filePath
    .foo()
    .bar;`,
            options: [2, { MemberExpression: 2 }]
        },
        {
            code: `\
for (const foo of bar)
  baz();`,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
        },
        {
            code: `\
var x = () =>
  5;`,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {

            // Don't lint the indentation of the first token after a :
            code: `\
({code:
  "foo.bar();"})`,
            options: [2]
        },
        {

            // Don't lint the indentation of the first token after a :
            code: `\
({code:
"foo.bar();"})`,
            options: [2]
        },
        {

            // Comments in switch cases
            code: `\
switch (foo) {
  // comment
  case study:
    // comment
    bar();
  case closed:
    /* multiline comment
    */
}`,
            options: [2, { SwitchCase: 1 }]
        },
        {

            // Comments in switch cases
            code: `\
switch (foo) {
  // comment
  case study:
  // the comment can also be here
  case closed:
}`,
            options: [2, { SwitchCase: 1 }]
        },
        {

            // BinaryExpressions with parens
            code: `\
foo && (
    bar
)`,
            options: [4]
        },
        {

            // BinaryExpressions with parens
            code: `\
foo && ((
    bar
))`,
            options: [4]
        },
        {
            code: `\
foo &&
    (
        bar
    )`,
            options: [4]
        },
        {
            code: `\
foo =
    bar;`,
            options: [4]
        },
        {
            code: `\
function foo() {
  var bar = function(baz,
        qux) {
    foobar();
  };
}`,
            options: [2, { FunctionExpression: { parameters: 3 } }]
        },
        {
            code: `\
function foo() {
    return (bar === 1 || bar === 2 &&
        (/Function/.test(grandparent.type))) &&
        directives(parent).indexOf(node) >= 0;
}`,
        },
        {
            code: `\
function foo() {
    return (foo === bar || (
        baz === qux && (
            foo === foo ||
            bar === bar ||
            baz === baz
        )
    ))
}`,
            options: [4]
        },
        {
            code: `\
if (
    foo === 1 ||
    bar === 1 ||
    // comment
    (baz === 1 && qux === 1)
) {}`
        },
        {
            code: `\
foo =
  (bar + baz);`,
            options: [2]
        },
        {
            code: `\
function foo() {
  return (bar === 1 || bar === 2) &&
    (z === 3 || z === 4);
}`,
            options: [2]
        },
        {
            code: `\
/* comment */ if (foo) {
  bar();
}`,
            options: [2]
        },
        {

            // Comments at the end of if blocks that have `else` blocks can either refer to the lines above or below them
            code: `\
if (foo) {
  bar();
// Otherwise, if foo is false, do baz.
// baz is very important.
} else {
  baz();
}`,
            options: [2]
        },
        {
            code: `\
function foo() {
  return ((bar === 1 || bar === 2) &&
    (z === 3 || z === 4));
}`,
            options: [2]
        },
        {
            code: `\
foo(
  bar,
  baz,
  qux
);`,
            options: [2, { CallExpression: { arguments: 1 } }]
        },
        {
            code: `\
foo(
\tbar,
\tbaz,
\tqux
);`,
            options: ["tab", { CallExpression: { arguments: 1 } }]
        },
        {
            code: `\
foo(bar,
        baz,
        qux);`,
            options: [4, { CallExpression: { arguments: 2 } }]
        },
        {
            code: `\
foo(
bar,
baz,
qux
);`,
            options: [2, { CallExpression: { arguments: 0 } }]
        },
        {
            code: `\
foo(bar,
    baz,
    qux
);`,
            options: [2, { CallExpression: { arguments: "first" } }]
        },
        {
            code: `\
foo(bar, baz,
    qux, barbaz,
    barqux, bazqux);`,
            options: [2, { CallExpression: { arguments: "first" } }]
        },
        {
            code: `\
foo(
                        bar, baz,
                        qux);`,
            options: [2, { CallExpression: { arguments: "first" } }]
        },
        {
            code: `\
foo(bar,
        1 + 2,
        !baz,
        new Car('!')
);`,
            options: [2, { CallExpression: { arguments: 4 } }]
        },
        {
            code: `\
foo(
    (bar)
);`,
        },
        {
            code: `\
foo(
    (bar)
);`,
            options: [4, { CallExpression: { arguments: 1 } }]
        },

        // https://github.com/eslint/eslint/issues/7484
        {
            code: `\
var foo = function() {
  return bar(
    [{
    }].concat(baz)
  );
};`,
            options: [2]
        },

        // https://github.com/eslint/eslint/issues/7573
        {
            code: `\
return (
    foo
);`,
            parserOptions: { ecmaFeatures: { globalReturn: true } }
        },
        {
            code: `\
return (
    foo
)`,
            parserOptions: { ecmaFeatures: { globalReturn: true } }
        },
        {
            code: `\
var foo = [
    bar,
    baz
]
`
        },
        {
            code: `\
var foo = [bar,
    baz,
    qux
]
`
        },
        {
            code: `\
var foo = [bar,
baz,
qux
]
`,
            options: [2, { ArrayExpression: 0 }]
        },
        {
            code: `\
var foo = [bar,
                baz,
                qux
]
`,
            options: [2, { ArrayExpression: 8 }]
        },
        {
            code: `\
var foo = [bar,
           baz,
           qux
]`,
            options: [2, { ArrayExpression: "first" }]
        },
        {
            code: `\
var foo = [bar,
           baz, qux
]`,
            options: [2, { ArrayExpression: "first" }]
        },
        {
            code: `\
var foo = [
        { bar: 1,
          baz: 2 },
        { bar: 3,
          baz: 4 }
]`,
            options: [4, { ArrayExpression: 2, ObjectExpression: "first" }]
        },
        {
            code: `\
var foo = {
bar: 1,
baz: 2
};`,
            options: [2, { ObjectExpression: 0 }]
        },
        {
            code: `\
var foo = { foo: 1, bar: 2,
            baz: 3 }`,
            options: [2, { ObjectExpression: "first" }]
        },
        {
            code: `\
var foo = [
        {
            foo: 1
        }
]`,
            options: [4, { ArrayExpression: 2 }]
        },
        {
            code: `\
function foo() {
  [
          foo
  ]
}`,
            options: [2, { ArrayExpression: 4 }]
        },
        {
            code: "[\n]",
            options: [2, { ArrayExpression: "first" }]
        },
        {
            code: "[\n]",
            options: [2, { ArrayExpression: 1 }]
        },
        {
            code: "{\n}",
            options: [2, { ObjectExpression: "first" }]
        },
        {
            code: "{\n}",
            options: [2, { ObjectExpression: 1 }]
        },
        {
            code: `\
var foo = [
  [
    1
  ]
]`,
            options: [2, { ArrayExpression: "first" }]
        },
        {
            code: `\
var foo = [ 1,
            [
              2
            ]
];`,
            options: [2, { ArrayExpression: "first" }]
        },
        {
            code: `\
var foo = bar(1,
              [ 2,
                3
              ]
);`,
            options: [4, { ArrayExpression: "first", CallExpression: { arguments: "first" } }]
        },
        {
            code: `\
var foo =
    [
    ]()`,
            options: [4, { CallExpression: { arguments: "first" }, ArrayExpression: "first" }]
        },

        // https://github.com/eslint/eslint/issues/7732
        {
            code: `\
const lambda = foo => {
  Object.assign({},
    filterName,
    {
      display
    }
  );
}`,
            options: [2, { ObjectExpression: 1 }],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
const lambda = foo => {
  Object.assign({},
    filterName,
    {
      display
    }
  );
}`,
            options: [2, { ObjectExpression: "first" }],
            parserOptions: { ecmaVersion: 6 }
        },

        // https://github.com/eslint/eslint/issues/7733
        {
            code: `\
var foo = function() {
\twindow.foo('foo',
\t\t{
\t\t\tfoo: 'bar',
\t\t\tbar: {
\t\t\t\tfoo: 'bar'
\t\t\t}
\t\t}
\t);
}`,
            options: ["tab"]
        },
        {
            code: `\
echo = spawn('cmd.exe',
             ['foo', 'bar',
              'baz']);`,
            options: [2, { ArrayExpression: "first", CallExpression: { arguments: "first" } }]
        },
        {
            code: `\
if (foo)
  bar();
// Otherwise, if foo is false, do baz.
// baz is very important.
else {
  baz();
}`,
            options: [2]
        },
        {
            code: `\
if (
    foo && bar ||
    baz && qux // This line is ignored because BinaryExpressions are not checked.
) {
    qux();
}`,
            options: [4]
        },
        {
            code: `\
var foo =
        1;`,
            options: [4, { VariableDeclarator: 2 }]
        },
        {
            code: `\
var foo = 1,
    bar =
    2;`,
            options: [4]
        },
        {
            code: `\
switch (foo) {
  case bar:
  {
    baz();
  }
}`,
            options: [2, { SwitchCase: 1 }]
        },

        // Template curlies
        {
            code: `\
\`foo\${
  bar}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
\`foo\${
  \`bar\${
    baz}\`}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
\`foo\${
  \`bar\${
    baz
  }\`
}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
\`foo\${
  (
    bar
  )
}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 }
        },
        {

            code: `\
function foo() {
    \`foo\${bar}baz\${
        qux}foo\${
        bar}baz\`
}
`,
            parserOptions: { ecmaVersion: 6 }
        },
        {

            // https://github.com/eslint/eslint/issues/7320
            code: `\
JSON
    .stringify(
        {
            ok: true
        }
    );`
        },

        // Don't check AssignmentExpression assignments
        {
            code: `\
foo =
    bar =
    baz;`
        },
        {
            code: `\
foo =
bar =
    baz;`
        },
        {
            code: `\
function foo() {
    const template = \`this indentation is not checked
because it's part of a template literal.\`;
}`,
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
function foo() {
    const template = \`the indentation of a \${
        node.type
    } node is checked.\`;
}`,
            parserOptions: { ecmaVersion: 6 }
        },
        {

            // https://github.com/eslint/eslint/issues/7320
            code: `\
JSON
    .stringify(
        {
            test: 'test'
        }
    );`,
            options: [4, { CallExpression: { arguments: 1 } }]
        },
        {
            code: `\
[
    foo,
    // comment
    // another comment
    bar
]`
        },
        {
            code: `\
if (foo) {
    /* comment */ bar();
}`
        },
        {
            code: `\
function foo() {
    return (
        1
    );
}`
        },
        {
            code: `\
function foo() {
    return (
        1
    )
}`,
        },
        {
            code: `\
if (
    foo &&
    !(
        bar
    )
) {}`
        },
        {

            // https://github.com/eslint/eslint/issues/6007
            code: `\
var abc = [
  (
    ''
  ),
  def,
]`,
            options: [2]
        },
        {
            code: `\
var abc = [
  (
    ''
  ),
  (
    'bar'
  )
]`,
            options: [2]
        },
        {

            // https://github.com/eslint/eslint/issues/6670
            code: `\
function f() {
    return asyncCall()
        .then(
            'some string',
            [
                1,
                2,
                3
            ]
        );
}`
        },
        {

            // https://github.com/eslint/eslint/issues/6670
            code: `\
function f() {
    return asyncCall()
        .then(
            'some string',
            [
                1,
                2,
                3
            ]
        );
}`,
            options: [4, { MemberExpression: 1 }]
        },

        // https://github.com/eslint/eslint/issues/7242
        {
            code: `\
var x = [
    [1],
    [2]
]`
        },
        {
            code: `\
var y = [
    {a: 1},
    {b: 2}
]`
        },
        {

            // https://github.com/eslint/eslint/issues/7522
            code: `\
foo(
)`
        },
        {

            // https://github.com/eslint/eslint/issues/7616
            code: `\
foo(
        bar,
        {
            baz: 1
        }
)`,
            options: [4, { CallExpression: { arguments: "first" } }],
        },
        {
            code: "new Foo"
        },
        {
            code: "new (Foo)"
        },
        {
            code: `\
if (Foo) {
    new Foo
}`
        },
        {
            code: `\
export {
    foo,
    bar,
    baz
}`,
            parserOptions: { sourceType: "module" }
        }
    ],


    invalid: [
        {
            code: `\
var a = b;
if (a) {
b();
}`,
            options: [2],
            errors: expectedErrors([[3, 2, 0, "Identifier"]]),
            output: `\
var a = b;
if (a) {
  b();
}`
        },
        {
            code: `\
require('http').request({hostname: 'localhost',
                  port: 80}, function(res) {
    res.end();
  });`,
            output: `\
require('http').request({hostname: 'localhost',
  port: 80}, function(res) {
  res.end();
});`,
            options: [2],
            errors: expectedErrors([[2, 2, 18, "Identifier"], [3, 2, 4, "Identifier"], [4, 0, 2, "Punctuator"]])
        },
        {
            code: `\
if (array.some(function(){
  return true;
})) {
a++; // ->
  b++;
    c++; // <-
}`,
            output: `\
if (array.some(function(){
  return true;
})) {
  a++; // ->
  b++;
  c++; // <-
}`,
            options: [2],
            errors: expectedErrors([[4, 2, 0, "Identifier"], [6, 2, 4, "Identifier"]])
        },
        {
            code: `\
if (a){
\tb=c;
\t\tc=d;
e=f;
}`,
            output: `\
if (a){
\tb=c;
\tc=d;
\te=f;
}`,
            options: ["tab"],
            errors: expectedErrors("tab", [[3, 1, 2, "Identifier"], [4, 1, 0, "Identifier"]])
        },
        {
            code: `\
if (a){
    b=c;
      c=d;
 e=f;
}`,
            output: `\
if (a){
    b=c;
    c=d;
    e=f;
}`,
            options: [4],
            errors: expectedErrors([[3, 4, 6, "Identifier"], [4, 4, 1, "Identifier"]])
        },
        {
            code: fixture,
            output: fixedFixture,
            options: [2, { SwitchCase: 1, MemberExpression: 1 }],
            errors: expectedErrors([
                [5, 2, 4, "Keyword"],
                [6, 2, 0, "Line"],
                [10, 4, 6, "Punctuator"],
                [11, 2, 4, "Punctuator"],

                [15, 4, 2, "Identifier"],
                [16, 2, 4, "Punctuator"],
                [23, 2, 4, "Punctuator"],
                [29, 2, 4, "Keyword"],
                [30, 4, 6, "Identifier"],
                [36, 4, 6, "Identifier"],
                [38, 2, 4, "Punctuator"],
                [39, 4, 2, "Identifier"],
                [40, 2, 0, "Punctuator"],
                [54, 2, 4, "Punctuator"],
                [114, 4, 2, "Keyword"],
                [120, 4, 6, "Keyword"],
                [124, 4, 2, "Keyword"],
                [134, 4, 6, "Keyword"],
                [138, 2, 3, "Punctuator"],
                [139, 2, 3, "Punctuator"],
                [143, 4, 0, "Identifier"],
                [144, 6, 2, "Punctuator"],
                [145, 6, 2, "Punctuator"],
                [151, 4, 6, "Identifier"],
                [152, 6, 8, "Punctuator"],
                [153, 6, 8, "Punctuator"],
                [159, 4, 2, "Identifier"],
                [161, 4, 6, "Identifier"],
                [175, 2, 0, "Identifier"],
                [177, 2, 4, "Identifier"],
                [189, 2, 0, "Keyword"],
                [193, 6, 4, "Identifier"],
                [195, 6, 8, "Identifier"],
                [228, 5, 4, "Identifier"],
                [231, 3, 2, "Punctuator"],
                [245, 0, 2, "Punctuator"],
                [248, 0, 2, "Punctuator"],
                [304, 4, 6, "Identifier"],
                [306, 4, 8, "Identifier"],
                [307, 2, 4, "Punctuator"],
                [308, 2, 4, "Identifier"],
                [311, 4, 6, "Identifier"],
                [312, 4, 6, "Identifier"],
                [313, 4, 6, "Identifier"],
                [314, 2, 4, "Punctuator"],
                [315, 2, 4, "Identifier"],
                [318, 4, 6, "Identifier"],
                [319, 4, 6, "Identifier"],
                [320, 4, 6, "Identifier"],
                [321, 2, 4, "Punctuator"],
                [322, 2, 4, "Identifier"],
                [326, 2, 1, "Numeric"],
                [327, 2, 1, "Numeric"],
                [328, 2, 1, "Numeric"],
                [329, 2, 1, "Numeric"],
                [330, 2, 1, "Numeric"],
                [331, 2, 1, "Numeric"],
                [332, 2, 1, "Numeric"],
                [333, 2, 1, "Numeric"],
                [334, 2, 1, "Numeric"],
                [335, 2, 1, "Numeric"],
                [340, 2, 4, "Identifier"],
                [341, 2, 0, "Identifier"],
                [344, 2, 4, "Identifier"],
                [345, 2, 0, "Identifier"],
                [348, 2, 4, "Identifier"],
                [349, 2, 0, "Identifier"],
                [355, 2, 0, "Identifier"],
                [357, 2, 4, "Identifier"],
                [361, 4, 6, "Identifier"],
                [362, 2, 4, "Punctuator"],
                [363, 2, 4, "Identifier"],
                [368, 2, 0, "Keyword"],
                [370, 2, 4, "Keyword"],
                [374, 4, 6, "Keyword"],
                [376, 4, 2, "Keyword"],
                [383, 2, 0, "Identifier"],
                [385, 2, 4, "Identifier"],
                [390, 2, 0, "Identifier"],
                [392, 2, 4, "Identifier"],
                [409, 2, 0, "Identifier"],
                [410, 2, 4, "Identifier"],
                [416, 2, 0, "Identifier"],
                [417, 2, 4, "Identifier"],
                [418, 0, 4, "Punctuator"],
                [422, 2, 4, "Identifier"],
                [423, 2, 0, "Identifier"],
                [427, 2, 6, "Identifier"],
                [428, 2, 8, "Identifier"],
                [429, 2, 4, "Identifier"],
                [430, 0, 4, "Punctuator"],
                [433, 2, 4, "Identifier"],
                [434, 0, 4, "Punctuator"],
                [437, 2, 0, "Identifier"],
                [438, 0, 4, "Punctuator"],
                [442, 2, 4, "Identifier"],
                [443, 2, 4, "Identifier"],
                [444, 0, 2, "Punctuator"],
                [451, 2, 0, "Identifier"],
                [453, 2, 4, "Identifier"],
                [499, 6, 8, "Punctuator"],
                [500, 8, 6, "Identifier"],
                [504, 4, 6, "Punctuator"],
                [505, 6, 8, "Identifier"],
                [506, 4, 8, "Punctuator"]
            ])
        },
        {
            code: `\
switch(value){
    case "1":
        a();
    break;
    case "2":
        a();
    break;
    default:
        a();
        break;
}`,
            output: `\
switch(value){
    case "1":
        a();
        break;
    case "2":
        a();
        break;
    default:
        a();
        break;
}`,
            options: [4, { SwitchCase: 1 }],
            errors: expectedErrors([[4, 8, 4, "Keyword"], [7, 8, 4, "Keyword"]])
        },
        {
            code: `\
var x = 0 &&
    {
       a: 1,
          b: 2
    };`,
            output: `\
var x = 0 &&
    {
        a: 1,
        b: 2
    };`,
            options: [4],
            errors: expectedErrors([[3, 8, 7, "Identifier"], [4, 8, 10, "Identifier"]])
        },
        {
            code: `\
switch(value){
    case "1":
        a();
        break;
    case "2":
        a();
        break;
    default:
    break;
}`,
            output: `\
switch(value){
    case "1":
        a();
        break;
    case "2":
        a();
        break;
    default:
        break;
}`,
            options: [4, { SwitchCase: 1 }],
            errors: expectedErrors([9, 8, 4, "Keyword"])
        },
        {
            code: `\
switch(value){
    case "1":
    case "2":
        a();
        break;
    default:
        break;
}
switch(value){
    case "1":
    break;
    case "2":
        a();
    break;
    default:
        a();
    break;
}`,
            output: `\
switch(value){
    case "1":
    case "2":
        a();
        break;
    default:
        break;
}
switch(value){
    case "1":
        break;
    case "2":
        a();
        break;
    default:
        a();
        break;
}`,
            options: [4, { SwitchCase: 1 }],
            errors: expectedErrors([[11, 8, 4, "Keyword"], [14, 8, 4, "Keyword"], [17, 8, 4, "Keyword"]])
        },
        {
            code: `\
switch(value){
case "1":
        a();
        break;
    case "2":
        break;
    default:
        break;
}`,
            output: `\
switch(value){
case "1":
    a();
    break;
case "2":
    break;
default:
    break;
}`,
            options: [4],
            errors: expectedErrors([
                [3, 4, 8, "Identifier"],
                [4, 4, 8, "Keyword"],
                [5, 0, 4, "Keyword"],
                [6, 4, 8, "Keyword"],
                [7, 0, 4, "Keyword"],
                [8, 4, 8, "Keyword"]
            ])
        },
        {
            code: `\
var obj = {foo: 1, bar: 2};
with (obj) {
console.log(foo + bar);
}`,
            output: `\
var obj = {foo: 1, bar: 2};
with (obj) {
    console.log(foo + bar);
}`,
            errors: expectedErrors([3, 4, 0, "Identifier"])
        },
        {
            code: `\
switch (a) {
case '1':
b();
break;
default:
c();
break;
}`,
            output: `\
switch (a) {
    case '1':
        b();
        break;
    default:
        c();
        break;
}`,
            options: [4, { SwitchCase: 1 }],
            errors: expectedErrors([
                [2, 4, 0, "Keyword"],
                [3, 8, 0, "Identifier"],
                [4, 8, 0, "Keyword"],
                [5, 4, 0, "Keyword"],
                [6, 8, 0, "Identifier"],
                [7, 8, 0, "Keyword"]
            ])
        },
        {
            code: `\
var foo = function(){
    foo
          .bar
}`,
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors(
                [3, 8, 10, "Punctuator"]
            )
        },
        {
            code: `\
var foo = function(){
    foo
             .bar
}`,
            options: [4, { MemberExpression: 2 }],
            errors: expectedErrors(
                [3, 12, 13, "Punctuator"]
            )
        },
        {
            code: `\
var foo = () => {
    foo
             .bar
}`,
            options: [4, { MemberExpression: 2 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors(
                [3, 12, 13, "Punctuator"]
            )
        },
        {
            code: `\
TestClass.prototype.method = function () {
  return Promise.resolve(3)
      .then(function (x) {
      return x;
    });
};`,
            options: [2, { MemberExpression: 1 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([3, 4, 6, "Punctuator"])
        },
        {
            code: `\
while (a)
b();`,
            output: `\
while (a)
    b();`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code: `\
lmn = [{
        a: 1
    },
    {
        b: 2
    },
    {
        x: 2
}];`,
            errors: expectedErrors([
                [2, 4, 8, "Identifier"],
                [3, 0, 4, "Punctuator"],
                [4, 0, 4, "Punctuator"],
                [5, 4, 8, "Identifier"],
                [6, 0, 4, "Punctuator"],
                [7, 0, 4, "Punctuator"],
                [8, 4, 8, "Identifier"]
            ])
        },
        {
            code: `\
for (var foo = 1;
foo < 10;
foo++) {}`,
            output: `\
for (var foo = 1;
    foo < 10;
    foo++) {}`,
            errors: expectedErrors([[2, 4, 0, "Identifier"], [3, 4, 0, "Identifier"]])
        },
        {
            code: `\
for (
var foo = 1;
foo < 10;
foo++
    ) {}`,
            output: `\
for (
    var foo = 1;
    foo < 10;
    foo++
) {}`,
            errors: expectedErrors([[2, 4, 0, "Keyword"], [3, 4, 0, "Identifier"], [4, 4, 0, "Identifier"], [5, 0, 4, "Punctuator"]])
        },
        {
            code: `\
for (;;)
b();`,
            output: `\
for (;;)
    b();`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code: `\
for (a in x)
b();`,
            output: `\
for (a in x)
    b();`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code: `\
do
b();
while(true)`,
            output: `\
do
    b();
while(true)`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code: `\
if(true)
b();`,
            output: `\
if(true)
    b();`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"]
            ])
        },
        {
            code: `\
var test = {
      a: 1,
    b: 2
    };`,
            output: `\
var test = {
  a: 1,
  b: 2
};`,
            options: [2],
            errors: expectedErrors([
                [2, 2, 6, "Identifier"],
                [3, 2, 4, "Identifier"],
                [4, 0, 4, "Punctuator"]
            ])
        },
        {
            code: `\
var a = function() {
      a++;
    b++;
          c++;
    },
    b;`,
            output: `\
var a = function() {
        a++;
        b++;
        c++;
    },
    b;`,
            options: [4],
            errors: expectedErrors([
                [2, 8, 6, "Identifier"],
                [3, 8, 4, "Identifier"],
                [4, 8, 10, "Identifier"]
            ])
        },
        {
            code: `\
var a = 1,
b = 2,
c = 3;`,
            output: `\
var a = 1,
    b = 2,
    c = 3;`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 0, "Identifier"],
                [3, 4, 0, "Identifier"]
            ])
        },
        {
            code: `\
[a, b,
c].forEach((index) => {
  index;
});`,
            output: `\
[a, b,
    c].forEach((index) => {
        index;
    });`,
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 0, "Identifier"],
                [3, 8, 2, "Identifier"],
                [4, 4, 0, "Punctuator"]
            ])
        },
        {
            code: `\
[a, b,
c].forEach(function(index){
  return index;
});`,
            output: `\
[a, b,
    c].forEach(function(index){
        return index;
    });`,
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 0, "Identifier"],
                [3, 8, 2, "Keyword"],
                [4, 4, 0, "Punctuator"]
            ])
        },
        {
            code: `\
[a, b, c].forEach(function(index){
  return index;
});`,
            output: `\
[a, b, c].forEach(function(index){
    return index;
});`,
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 2, "Keyword"]
            ])
        },
        {
            code: `\
(foo)
    .bar([
    baz
]);`,
            output: `\
(foo)
    .bar([
        baz
    ]);`,
            options: [4, { MemberExpression: 1 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[3, 8, 4, "Identifier"], [4, 4, 0, "Punctuator"]])
        },
        {
            code: `\
var x = ['a',
         'b',
         'c'
];`,
            output: `\
var x = ['a',
    'b',
    'c'
];`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 9, "String"],
                [3, 4, 9, "String"]
            ])
        },
        {
            code: `\
var x = [
         'a',
         'b',
         'c'
];`,
            output: `\
var x = [
    'a',
    'b',
    'c'
];`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 9, "String"],
                [3, 4, 9, "String"],
                [4, 4, 9, "String"]
            ])
        },
        {
            code: `\
var x = [
         'a',
         'b',
         'c',
'd'];`,
            output: `\
var x = [
    'a',
    'b',
    'c',
    'd'];`,
            options: [4],
            errors: expectedErrors([
                [2, 4, 9, "String"],
                [3, 4, 9, "String"],
                [4, 4, 9, "String"],
                [5, 4, 0, "String"]
            ])
        },
        {
            code: `\
var x = [
         'a',
         'b',
         'c'
  ];`,
            output: `\
var x = [
    'a',
    'b',
    'c'
];`,
            options: [4],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 9, "String"],
                [3, 4, 9, "String"],
                [4, 4, 9, "String"],
                [5, 0, 2, "Punctuator"]
            ])
        },
        {
            code: `\
while (1 < 2)
console.log('foo')
  console.log('bar')`,
            output: `\
while (1 < 2)
  console.log('foo')
console.log('bar')`,
            options: [2],
            errors: expectedErrors([
                [2, 2, 0, "Identifier"],
                [3, 0, 2, "Identifier"]
            ])
        },
        {
            code: `\
function salutation () {
  switch (1) {
  case 0: return console.log('hi')
    case 1: return console.log('hey')
  }
}`,
            output: `\
function salutation () {
  switch (1) {
    case 0: return console.log('hi')
    case 1: return console.log('hey')
  }
}`,
            options: [2, { SwitchCase: 1 }],
            errors: expectedErrors([
                [3, 4, 2, "Keyword"]
            ])
        },
        {
            code: `\
var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,
height, rotate;`,
            output: `\
var geometry, box, face1, face2, colorT, colorB, sprite, padding, maxWidth,
  height, rotate;`,
            options: [2, { SwitchCase: 1 }],
            errors: expectedErrors([
                [2, 2, 0, "Identifier"]
            ])
        },
        {
            code: `\
switch (a) {
case '1':
b();
break;
default:
c();
break;
}`,
            output: `\
switch (a) {
        case '1':
            b();
            break;
        default:
            c();
            break;
}`,
            options: [4, { SwitchCase: 2 }],
            errors: expectedErrors([
                [2, 8, 0, "Keyword"],
                [3, 12, 0, "Identifier"],
                [4, 12, 0, "Keyword"],
                [5, 8, 0, "Keyword"],
                [6, 12, 0, "Identifier"],
                [7, 12, 0, "Keyword"]
            ])
        },
        {
            code: `\
var geometry,
rotate;`,
            output: `\
var geometry,
  rotate;`,
            options: [2, { VariableDeclarator: 1 }],
            errors: expectedErrors([
                [2, 2, 0, "Identifier"]
            ])
        },
        {
            code: `\
var geometry,
  rotate;`,
            output: `\
var geometry,
    rotate;`,
            options: [2, { VariableDeclarator: 2 }],
            errors: expectedErrors([
                [2, 4, 2, "Identifier"]
            ])
        },
        {
            code: `\
var geometry,
\trotate;`,
            output: `\
var geometry,
\t\trotate;`,
            options: ["tab", { VariableDeclarator: 2 }],
            errors: expectedErrors("tab", [
                [2, 2, 1, "Identifier"]
            ])
        },
        {
            code: `\
let geometry,
  rotate;`,
            output: `\
let geometry,
    rotate;`,
            options: [2, { VariableDeclarator: 2 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 4, 2, "Identifier"]
            ])
        },
        {
            code: `\
if(true)
  if (true)
    if (true)
    console.log(val);`,
            output: `\
if(true)
  if (true)
    if (true)
      console.log(val);`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            errors: expectedErrors([
                [4, 6, 4, "Identifier"]
            ])
        },
        {
            code: `\
var a = {
    a: 1,
    b: 2
}`,
            output: `\
var a = {
  a: 1,
  b: 2
}`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            errors: expectedErrors([
                [2, 2, 4, "Identifier"],
                [3, 2, 4, "Identifier"]
            ])
        },
        {
            code: `\
var a = [
    a,
    b
]`,
            output: `\
var a = [
  a,
  b
]`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            errors: expectedErrors([
                [2, 2, 4, "Identifier"],
                [3, 2, 4, "Identifier"]
            ])
        },
        {
            code: `\
let a = [
    a,
    b
]`,
            output: `\
let a = [
  a,
  b
]`,
            options: [2, { VariableDeclarator: { let: 2 }, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [2, 2, 4, "Identifier"],
                [3, 2, 4, "Identifier"]
            ])
        },
        {
            code: `\
var a = new Test({
      a: 1
  }),
    b = 4;`,
            output: `\
var a = new Test({
        a: 1
    }),
    b = 4;`,
            options: [4],
            errors: expectedErrors([
                [2, 8, 6, "Identifier"],
                [3, 4, 2, "Punctuator"]
            ])
        },
        {
            code: `\
var a = new Test({
      a: 1
    }),
    b = 4;
const a = new Test({
      a: 1
    }),
    b = 4;`,
            output: `\
var a = new Test({
      a: 1
    }),
    b = 4;
const a = new Test({
    a: 1
  }),
  b = 4;`,
            options: [2, { VariableDeclarator: { var: 2 } }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([
                [6, 4, 6, "Identifier"],
                [7, 2, 4, "Punctuator"],
                [8, 2, 4, "Identifier"]
            ])
        },
        {
            code: `\
var abc = 5,
    c = 2,
    xyz =
    {
      a: 1,
       b: 2
    };`,
            output: `\
var abc = 5,
    c = 2,
    xyz =
    {
      a: 1,
      b: 2
    };`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            errors: expectedErrors([6, 6, 7, "Identifier"])
        },
        {
            code: `\
var abc =
     {
       a: 1,
        b: 2
     };`,
            output: `\
var abc =
     {
       a: 1,
       b: 2
     };`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            errors: expectedErrors([4, 7, 8, "Identifier"])
        },
        {
            code: `\
var foo = {
    bar: 1,
    baz: {
        qux: 2
      }
  },
  bar = 1;`,
            output: `\
var foo = {
    bar: 1,
    baz: {
      qux: 2
    }
  },
  bar = 1;`,
            options: [2],
            errors: expectedErrors([[4, 6, 8, "Identifier"], [5, 4, 6, "Punctuator"]])
        },
        {
            code: `\
var path     = require('path')
 , crypto    = require('crypto')
;`,
            output: `\
var path     = require('path')
  , crypto    = require('crypto')
;`,
            options: [2],
            errors: expectedErrors([
                [2, 2, 1, "Punctuator"]
            ])
        },
        {
            code: `\
var a = 1
   ,b = 2
;`,
            output: `\
var a = 1
    ,b = 2
;`,
            errors: expectedErrors([
                [2, 4, 3, "Punctuator"],
            ])
        },
        {
            code: `\
class A{
  constructor(){}
    a(){}
    get b(){}
}`,
            output: `\
class A{
    constructor(){}
    a(){}
    get b(){}
}`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 4, 2, "Identifier"]])
        },
        {
            code: `\
var A = class {
  constructor(){}
    a(){}
  get b(){}
};`,
            output: `\
var A = class {
    constructor(){}
    a(){}
    get b(){}
};`,
            options: [4, { VariableDeclarator: 1, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 4, 2, "Identifier"], [4, 4, 2, "Identifier"]])
        },
        {
            code: `\
var a = 1,
    B = class {
    constructor(){}
      a(){}
      get b(){}
    };`,
            output: `\
var a = 1,
    B = class {
      constructor(){}
      a(){}
      get b(){}
    };`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[3, 6, 4, "Identifier"]])
        },
        {
            code: `\
{
    if(a){
        foo();
    }
  else{
        bar();
    }
}`,
            output: `\
{
    if(a){
        foo();
    }
    else{
        bar();
    }
}`,
            options: [4],
            errors: expectedErrors([[5, 4, 2, "Keyword"]])
        },
        {
            code: `\
{
    if(a){
        foo();
    }
  else
        bar();

}`,
            output: `\
{
    if(a){
        foo();
    }
    else
        bar();

}`,
            options: [4],
            errors: expectedErrors([[5, 4, 2, "Keyword"]])
        },
        {
            code: `\
{
    if(a)
        foo();
  else
        bar();
}`,
            output: `\
{
    if(a)
        foo();
    else
        bar();
}`,
            options: [4],
            errors: expectedErrors([[4, 4, 2, "Keyword"]])
        },
        {
            code: `\
(function(){
  function foo(x) {
    return x + 1;
  }
})();`,
            output: `\
(function(){
function foo(x) {
  return x + 1;
}
})();`,
            options: [2, { outerIIFEBody: 0 }],
            errors: expectedErrors([[2, 0, 2, "Keyword"], [3, 2, 4, "Keyword"], [4, 0, 2, "Punctuator"]])
        },
        {
            code: `\
(function(){
    function foo(x) {
        return x + 1;
    }
})();`,
            output: `\
(function(){
        function foo(x) {
            return x + 1;
        }
})();`,
            options: [4, { outerIIFEBody: 2 }],
            errors: expectedErrors([[2, 8, 4, "Keyword"], [3, 12, 8, "Keyword"], [4, 8, 4, "Punctuator"]])
        },
        {
            code: `\
if(data) {
console.log('hi');
}`,
            options: [2, { outerIIFEBody: 0 }],
            errors: expectedErrors([[2, 2, 0, "Identifier"]])
        },
        {
            code: `\
var ns = function(){
    function fooVar(x) {
        return x + 1;
    }
}(x);`,
            output: `\
var ns = function(){
        function fooVar(x) {
            return x + 1;
        }
}(x);`,
            options: [4, { outerIIFEBody: 2 }],
            errors: expectedErrors([[2, 8, 4, "Keyword"], [3, 12, 8, "Keyword"], [4, 8, 4, "Punctuator"]])
        },
        {
            code: `\
var obj = {
  foo: function() {
  return true;
  }()
};`,
            options: [2, { outerIIFEBody: 0 }],
            errors: expectedErrors([[3, 4, 2, "Keyword"]])
        },
        {
            code: `\
typeof function() {
    function fooVar(x) {
      return x + 1;
    }
}();`,
            output: `\
typeof function() {
  function fooVar(x) {
    return x + 1;
  }
}();`,
            options: [2, { outerIIFEBody: 2 }],
            errors: expectedErrors([[2, 2, 4, "Keyword"], [3, 4, 6, "Keyword"], [4, 2, 4, "Punctuator"]])
        },
        {
            code: `\
{
\t!function(x) {
\t\t\t\treturn x + 1;
\t}()
};`,
            output: `\
{
\t!function(x) {
\t\treturn x + 1;
\t}()
};`,
            options: ["tab", { outerIIFEBody: 3 }],
            errors: expectedErrors("tab", [[3, 2, 4, "Keyword"]])
        },
        {
            code: `\
Buffer
.toString()`,
            output: `\
Buffer
    .toString()`,
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors([[2, 4, 0, "Punctuator"]])
        },
        {
            code: `\
Buffer
    .indexOf('a')
.toString()`,
            output: `\
Buffer
    .indexOf('a')
    .toString()`,
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors([[3, 4, 0, "Punctuator"]])
        },
        {
            code: `\
Buffer.
length`,
            output: `\
Buffer.
    length`,
            options: [4, { MemberExpression: 1 }],
            errors: expectedErrors([[2, 4, 0, "Identifier"]])
        },
        {
            code: `\
Buffer.
\t\tlength`,
            output: `\
Buffer.
\tlength`,
            options: ["tab", { MemberExpression: 1 }],
            errors: expectedErrors("tab", [[2, 1, 2, "Identifier"]])
        },
        {
            code: `\
Buffer
  .foo
  .bar`,
            output: `\
Buffer
    .foo
    .bar`,
            options: [2, { MemberExpression: 2 }],
            errors: expectedErrors([[2, 4, 2, "Punctuator"], [3, 4, 2, "Punctuator"]])
        },
        {

            // Indentation with multiple else statements: https://github.com/eslint/eslint/issues/6956

            code: `\
if (foo) bar();
else if (baz) foobar();
  else if (qux) qux();`,
            output: `\
if (foo) bar();
else if (baz) foobar();
else if (qux) qux();`,
            options: [2],
            errors: expectedErrors([3, 0, 2, "Keyword"])
        },
        {
            code: `\
if (foo) bar();
else if (baz) foobar();
  else qux();`,
            output: `\
if (foo) bar();
else if (baz) foobar();
else qux();`,
            options: [2],
            errors: expectedErrors([3, 0, 2, "Keyword"])
        },
        {
            code: `\
foo();
  if (baz) foobar();
  else qux();`,
            output: `\
foo();
if (baz) foobar();
else qux();`,
            options: [2],
            errors: expectedErrors([[2, 0, 2, "Keyword"], [3, 0, 2, "Keyword"]])
        },
        {
            code: `\
if (foo) bar();
else if (baz) foobar();
     else if (bip) {
       qux();
     }`,
            output: `\
if (foo) bar();
else if (baz) foobar();
else if (bip) {
  qux();
}`,
            options: [2],
            errors: expectedErrors([[3, 0, 5, "Keyword"], [4, 2, 7, "Identifier"], [5, 0, 5, "Punctuator"]])
        },
        {
            code: `\
if (foo) bar();
else if (baz) {
    foobar();
     } else if (boop) {
       qux();
     }`,
            output: `\
if (foo) bar();
else if (baz) {
  foobar();
} else if (boop) {
  qux();
}`,
            options: [2],
            errors: expectedErrors([[3, 2, 4, "Identifier"], [4, 0, 5, "Punctuator"], [5, 2, 7, "Identifier"], [6, 0, 5, "Punctuator"]])
        },
        {
            code: `\
function foo(aaa,
    bbb, ccc, ddd) {
      bar();
}`,
            output: `\
function foo(aaa,
  bbb, ccc, ddd) {
    bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: 1, body: 2 } }],
            errors: expectedErrors([[2, 2, 4, "Identifier"], [3, 4, 6, "Identifier"]])
        },
        {
            code: `\
function foo(aaa, bbb,
  ccc, ddd) {
bar();
}`,
            output: `\
function foo(aaa, bbb,
      ccc, ddd) {
  bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: 3, body: 1 } }],
            errors: expectedErrors([[2, 6, 2, "Identifier"], [3, 2, 0, "Identifier"]])
        },
        {
            code: `\
function foo(aaa,
        bbb,
  ccc) {
      bar();
}`,
            output: `\
function foo(aaa,
    bbb,
    ccc) {
            bar();
}`,
            options: [4, { FunctionDeclaration: { parameters: 1, body: 3 } }],
            errors: expectedErrors([[2, 4, 8, "Identifier"], [3, 4, 2, "Identifier"], [4, 12, 6, "Identifier"]])
        },
        {
            code: `\
function foo(aaa,
  bbb, ccc,
                   ddd, eee, fff) {
   bar();
}`,
            output: `\
function foo(aaa,
             bbb, ccc,
             ddd, eee, fff) {
  bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: "first", body: 1 } }],
            errors: expectedErrors([[2, 13, 2, "Identifier"], [3, 13, 19, "Identifier"], [4, 2, 3, "Identifier"]])
        },
        {
            code: `\
function foo(aaa, bbb)
{
bar();
}`,
            output: `\
function foo(aaa, bbb)
{
      bar();
}`,
            options: [2, { FunctionDeclaration: { body: 3 } }],
            errors: expectedErrors([3, 6, 0, "Identifier"])
        },
        {
            code: `\
function foo(
aaa,
    bbb) {
bar();
}`,
            output: `\
function foo(
aaa,
bbb) {
    bar();
}`,
            options: [2, { FunctionDeclaration: { parameters: "first", body: 2 } }],
            errors: expectedErrors([[3, 0, 4, "Identifier"], [4, 4, 0, "Identifier"]])
        },
        {
            code: `\
var foo = function(aaa,
  bbb,
    ccc,
      ddd) {
  bar();
}`,
            output: `\
var foo = function(aaa,
    bbb,
    ccc,
    ddd) {
bar();
}`,
            options: [2, { FunctionExpression: { parameters: 2, body: 0 } }],
            errors: expectedErrors([[2, 4, 2, "Identifier"], [4, 4, 6, "Identifier"], [5, 0, 2, "Identifier"]])
        },
        {
            code: `\
var foo = function(aaa,
   bbb,
 ccc) {
  bar();
}`,
            output: `\
var foo = function(aaa,
  bbb,
  ccc) {
                    bar();
}`,
            options: [2, { FunctionExpression: { parameters: 1, body: 10 } }],
            errors: expectedErrors([[2, 2, 3, "Identifier"], [3, 2, 1, "Identifier"], [4, 20, 2, "Identifier"]])
        },
        {
            code: `\
var foo = function(aaa,
  bbb, ccc, ddd,
                        eee, fff) {
        bar();
}`,
            output: `\
var foo = function(aaa,
                   bbb, ccc, ddd,
                   eee, fff) {
    bar();
}`,
            options: [4, { FunctionExpression: { parameters: "first", body: 1 } }],
            errors: expectedErrors([[2, 19, 2, "Identifier"], [3, 19, 24, "Identifier"], [4, 4, 8, "Identifier"]])
        },
        {
            code: `\
var foo = function(
aaa, bbb, ccc,
    ddd, eee) {
  bar();
}`,
            output: `\
var foo = function(
aaa, bbb, ccc,
ddd, eee) {
      bar();
}`,
            options: [2, { FunctionExpression: { parameters: "first", body: 3 } }],
            errors: expectedErrors([[3, 0, 4, "Identifier"], [4, 6, 2, "Identifier"]])
        },
        {
            code: `\
var foo = bar;
\t\t\tvar baz = qux;`,
            output: `\
var foo = bar;
var baz = qux;`,
            options: [2],
            errors: expectedErrors([2, "0 spaces", "3 tabs", "Keyword"])
        },
        {
            code: `\
function foo() {
\tbar();
  baz();
              qux();
}`,
            output: `\
function foo() {
\tbar();
\tbaz();
\tqux();
}`,
            options: ["tab"],
            errors: expectedErrors("tab", [[3, "1 tab", "2 spaces", "Identifier"], [4, "1 tab", "14 spaces", "Identifier"]])
        },
        {
            code: `\
function foo() {
  bar();
\t\t}`,
            output: `\
function foo() {
  bar();
}`,
            options: [2],
            errors: expectedErrors([[3, "0 spaces", "2 tabs", "Punctuator"]])
        },
        {
            code: `\
function foo() {
  function bar() {
        baz();
  }
}`,
            output: `\
function foo() {
  function bar() {
    baz();
  }
}`,
            options: [2, { FunctionDeclaration: { body: 1 } }],
            errors: expectedErrors([3, 4, 8, "Identifier"])
        },
        {
            code: `\
function foo() {
  function bar(baz,
    qux) {
    foobar();
  }
}`,
            output: `\
function foo() {
  function bar(baz,
      qux) {
    foobar();
  }
}`,
            options: [2, { FunctionDeclaration: { body: 1, parameters: 2 } }],
            errors: expectedErrors([3, 6, 4, "Identifier"])
        },
        {
            code: `\
function foo() {
  var bar = function(baz,
          qux) {
    foobar();
  };
}`,
            output: `\
function foo() {
  var bar = function(baz,
        qux) {
    foobar();
  };
}`,
            options: [2, { FunctionExpression: { parameters: 3 } }],
            errors: expectedErrors([3, 8, 10, "Identifier"])
        },
        {
            code: `\
foo.bar(
      baz, qux, function() {
        qux;
      }
);`,
            output: `\
foo.bar(
      baz, qux, function() {
            qux;
      }
);`,
            options: [2, { FunctionExpression: { body: 3 } }],
            errors: expectedErrors([3, 12, 8, "Identifier"])
        },
        {
            code: `\
{
    try {
    }
catch (err) {
    }
finally {
    }
}`,
            output: `\
{
    try {
    }
    catch (err) {
    }
    finally {
    }
}`,
            errors: expectedErrors([
                [4, 4, 0, "Keyword"],
                [6, 4, 0, "Keyword"]
            ])
        },
        {
            code: `\
{
    do {
    }
while (true)
}`,
            output: `\
{
    do {
    }
    while (true)
}`,
            errors: expectedErrors([4, 4, 0, "Keyword"])
        },
        {
            code: `\
function foo() {
  bar();
\t\t}`,
            output: `\
function foo() {
  bar();
}`,
            options: [2],
            errors: expectedErrors([[3, "0 spaces", "2 tabs", "Punctuator"]])
        },
        {
            code: `\
function foo() {
  return (
    1
    )
}`,
            output: `\
function foo() {
  return (
    1
  )
}`,
            options: [2],
            errors: expectedErrors([[4, 2, 4, "Punctuator"]])
        },
        {
            code: `\
function foo() {
  return (
    1
    );
}`,
            output: `\
function foo() {
  return (
    1
  );
}`,
            options: [2],
            errors: expectedErrors([[4, 2, 4, "Punctuator"]])
        },
        {
            code: `\
function foo() {
  bar();
\t\t}`,
            output: `\
function foo() {
  bar();
}`,
            options: [2],
            errors: expectedErrors([[3, "0 spaces", "2 tabs", "Punctuator"]])
        },
        {
            code: `\
function test(){
  switch(length){
    case 1: return function(a){
    return fn.call(that, a);
    };
  }
}`,
            output: `\
function test(){
  switch(length){
    case 1: return function(a){
      return fn.call(that, a);
    };
  }
}`,
            options: [2, { VariableDeclarator: 2, SwitchCase: 1 }],
            errors: expectedErrors([[4, 6, 4, "Keyword"]])
        },
        {
            code: `\
function foo() {
   return 1
}`,
            output: `\
function foo() {
  return 1
}`,
            options: [2],
            errors: expectedErrors([[2, 2, 3, "Keyword"]])
        },
        {
            code: `\
foo(
bar,
  baz,
    qux);`,
            output: `\
foo(
  bar,
  baz,
  qux);`,
            options: [2, { CallExpression: { arguments: 1 } }],
            errors: expectedErrors([[2, 2, 0, "Identifier"], [4, 2, 4, "Identifier"]])
        },
        {
            code: `\
foo(
\tbar,
\tbaz);`,
            output: `\
foo(
    bar,
    baz);`,
            options: [2, { CallExpression: { arguments: 2 } }],
            errors: expectedErrors([[2, "4 spaces", "1 tab", "Identifier"], [3, "4 spaces", "1 tab", "Identifier"]])
        },
        {
            code: `\
foo(bar,
\t\tbaz,
\t\tqux);`,
            output: `\
foo(bar,
\tbaz,
\tqux);`,
            options: ["tab", { CallExpression: { arguments: 1 } }],
            errors: expectedErrors("tab", [[2, 1, 2, "Identifier"], [3, 1, 2, "Identifier"]])
        },
        {
            code: `\
foo(bar, baz,
         qux);`,
            output: `\
foo(bar, baz,
    qux);`,
            options: [2, { CallExpression: { arguments: "first" } }],
            errors: expectedErrors([2, 4, 9, "Identifier"])
        },
        {
            code: `\
foo(
          bar,
    baz);`,
            output: `\
foo(
          bar,
          baz);`,
            options: [2, { CallExpression: { arguments: "first" } }],
            errors: expectedErrors([3, 10, 4, "Identifier"])
        },
        {
            code: `\
foo(bar,
  1 + 2,
              !baz,
        new Car('!')
);`,
            output: `\
foo(bar,
      1 + 2,
      !baz,
      new Car('!')
);`,
            options: [2, { CallExpression: { arguments: 3 } }],
            errors: expectedErrors([[2, 6, 2, "Numeric"], [3, 6, 14, "Punctuator"], [4, 6, 8, "Keyword"]])
        },

        // https://github.com/eslint/eslint/issues/7573
        {
            code: `\
return (
    foo
    );`,
            output: `\
return (
    foo
);`,
            parserOptions: { ecmaFeatures: { globalReturn: true } },
            errors: expectedErrors([3, 0, 4, "Punctuator"])
        },
        {
            code: `\
return (
    foo
    )`,
            output: `\
return (
    foo
)`,
            parserOptions: { ecmaFeatures: { globalReturn: true } },
            errors: expectedErrors([3, 0, 4, "Punctuator"])
        },

        // https://github.com/eslint/eslint/issues/7604
        {
            code: `\
if (foo) {
        /* comment */bar();
}`,
            output: `\
if (foo) {
    /* comment */bar();
}`,
            errors: expectedErrors([2, 4, 8, "Block"])
        },
        {
            code: `\
foo('bar',
        /** comment */{
        ok: true
    });`,
            output: `\
foo('bar',
    /** comment */{
        ok: true
    });`,
            errors: expectedErrors([2, 4, 8, "Block"])
        },
        {
            code: `\
foo(
(bar)
);`,
            output: `\
foo(
    (bar)
);`,
            options: [4, { CallExpression: { arguments: 1 } }],
            errors: expectedErrors([2, 4, 0, "Punctuator"])
        },
        {
            code: `\
((
foo
))`,
            output: `\
((
    foo
))`,
            options: [4],
            errors: expectedErrors([2, 4, 0, "Identifier"])
        },

        // ternary expressions (https://github.com/eslint/eslint/issues/7420)
        {
            code: `\
foo
? bar
    : baz`,
            output: `\
foo
  ? bar
  : baz`,
            options: [2],
            errors: expectedErrors([[2, 2, 0, "Punctuator"], [3, 2, 4, "Punctuator"]])
        },
        {
            code: `\
[
    foo ?
        bar :
        baz,
        qux
]`,
            output: `\
[
    foo ?
        bar :
        baz,
    qux
]`,
            errors: expectedErrors([5, 4, 8, "Identifier"])
        },
        {

            // Checking comments:
            // https://github.com/eslint/eslint/issues/6571
            code: `\
foo();
  // comment
    /* multiline
  comment */
bar();
 // trailing comment`,
            output: `\
foo();
// comment
/* multiline
  comment */
bar();
// trailing comment`,
            options: [2],
            errors: expectedErrors([[2, 0, 2, "Line"], [3, 0, 4, "Block"], [6, 0, 1, "Line"]])
        },
        {
            code: `\
[
        // no elements
]`,
            output: `\
[
    // no elements
]`,
            errors: expectedErrors([2, 4, 8, "Line"])
        },
        {

            // Destructuring assignments:
            // https://github.com/eslint/eslint/issues/6813
            code: `\
var {
foo,
  bar,
    baz: qux,
      foobar: baz = foobar
  } = qux;`,
            output: `\
var {
  foo,
  bar,
  baz: qux,
  foobar: baz = foobar
} = qux;`,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 2, 0, "Identifier"], [4, 2, 4, "Identifier"], [5, 2, 6, "Identifier"], [6, 0, 2, "Punctuator"]])
        },
        {
            code: `\
var foo = [
           bar,
  baz
          ]`,
            output: `\
var foo = [
    bar,
    baz
]`,
            errors: expectedErrors([[2, 4, 11, "Identifier"], [3, 4, 2, "Identifier"], [4, 0, 10, "Punctuator"]])
        },
        {
            code: `\
var foo = [bar,
baz,
    qux
]`,
            output: `\
var foo = [bar,
    baz,
    qux
]`,
            errors: expectedErrors([2, 4, 0, "Identifier"])
        },
        {
            code: `\
var foo = [bar,
  baz,
  qux
]`,
            output: `\
var foo = [bar,
baz,
qux
]`,
            options: [2, { ArrayExpression: 0 }],
            errors: expectedErrors([[2, 0, 2, "Identifier"], [3, 0, 2, "Identifier"]])
        },
        {
            code: `\
var foo = [bar,
  baz,
  qux
]`,
            output: `\
var foo = [bar,
                baz,
                qux
]`,
            options: [2, { ArrayExpression: 8 }],
            errors: expectedErrors([[2, 16, 2, "Identifier"], [3, 16, 2, "Identifier"]])
        },
        {
            code: `\
var foo = [bar,
    baz,
    qux
]`,
            output: `\
var foo = [bar,
           baz,
           qux
]`,
            options: [2, { ArrayExpression: "first" }],
            errors: expectedErrors([[2, 11, 4, "Identifier"], [3, 11, 4, "Identifier"]])
        },
        {
            code: `\
var foo = [bar,
    baz, qux
]`,
            output: `\
var foo = [bar,
           baz, qux
]`,
            options: [2, { ArrayExpression: "first" }],
            errors: expectedErrors([2, 11, 4, "Identifier"])
        },
        {
            code: `\
var foo = [
        { bar: 1,
            baz: 2 },
        { bar: 3,
            qux: 4 }
]`,
            output: `\
var foo = [
        { bar: 1,
          baz: 2 },
        { bar: 3,
          qux: 4 }
]`,
            options: [4, { ArrayExpression: 2, ObjectExpression: "first" }],
            errors: expectedErrors([[3, 10, 12, "Identifier"], [5, 10, 12, "Identifier"]])
        },
        {
            code: `\
var foo = {
  bar: 1,
  baz: 2
};`,
            output: `\
var foo = {
bar: 1,
baz: 2
};`,
            options: [2, { ObjectExpression: 0 }],
            errors: expectedErrors([[2, 0, 2, "Identifier"], [3, 0, 2, "Identifier"]])
        },
        {
            code: `\
var quux = { foo: 1, bar: 2,
baz: 3 }`,
            output: `\
var quux = { foo: 1, bar: 2,
             baz: 3 }`,
            options: [2, { ObjectExpression: "first" }],
            errors: expectedErrors([2, 13, 0, "Identifier"])
        },
        {
            code: `\
function foo() {
    [
            foo
    ]
}`,
            output: `\
function foo() {
  [
          foo
  ]
}`,
            options: [2, { ArrayExpression: 4 }],
            errors: expectedErrors([[2, 2, 4, "Punctuator"], [3, 10, 12, "Identifier"], [4, 2, 4, "Punctuator"]])
        },
        {
            code: `\
var [
foo,
  bar,
    baz,
      foobar = baz
  ] = qux;`,
            output: `\
var [
  foo,
  bar,
  baz,
  foobar = baz
] = qux;`,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 2, 0, "Identifier"], [4, 2, 4, "Identifier"], [5, 2, 6, "Identifier"], [6, 0, 2, "Punctuator"]])
        },
        {
            code: `\
import {
foo,
  bar,
    baz
} from 'qux';`,
            output: `\
import {
    foo,
    bar,
    baz
} from 'qux';`,
            parserOptions: { sourceType: "module" },
            errors: expectedErrors([[2, 4, 0, "Identifier"], [3, 4, 2, "Identifier"]])
        },
        {

            // https://github.com/eslint/eslint/issues/7233
            code: `\
var folder = filePath
  .foo()
      .bar;`,
            options: [2, { MemberExpression: 2 }],
            errors: expectedErrors([[2, 4, 2, "Punctuator"], [3, 4, 6, "Punctuator"]])
        },
        {
            code: `\
for (const foo of bar)
    baz();`,
            output: `\
for (const foo of bar)
  baz();`,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([2, 2, 4, "Identifier"])
        },
        {
            code: `\
var x = () =>
    5;`,
            output: `\
var x = () =>
  5;`,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([2, 2, 4, "Numeric"])
        },
        {

            // BinaryExpressions with parens
            code: `\
foo && (
        bar
)`,
            output: `\
foo && (
    bar
)`,
            options: [4],
            errors: expectedErrors([2, 4, 8, "Identifier"])
        },

        // Template curlies
        {
            code: `\
\`foo\${
bar}\``,
            output: `\
\`foo\${
  bar}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([2, 2, 0, "Identifier"])
        },
        {
            code: `\
\`foo\${
    \`bar\${
baz}\`}\``,
            output: `\
\`foo\${
  \`bar\${
    baz}\`}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 2, 4, "Template"], [3, 4, 0, "Identifier"]])
        },
        {
            code: `\
\`foo\${
    \`bar\${
  baz
    }\`
  }\``,
            output: `\
\`foo\${
  \`bar\${
    baz
  }\`
}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 2, 4, "Template"], [3, 4, 2, "Identifier"], [4, 2, 4, "Template"], [5, 0, 2, "Template"]])
        },
        {
            code: `\
\`foo\${
(
  bar
)
}\``,
            output: `\
\`foo\${
  (
    bar
  )
}\``,
            options: [2],
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[2, 2, 0, "Punctuator"], [3, 4, 2, "Identifier"], [4, 2, 0, "Punctuator"]])
        },
        {
            code: `\
function foo() {
    \`foo\${bar}baz\${
qux}foo\${
  bar}baz\`
}`,
            output: `\
function foo() {
    \`foo\${bar}baz\${
        qux}foo\${
        bar}baz\`
}`,
            parserOptions: { ecmaVersion: 6 },
            errors: expectedErrors([[3, 8, 0, "Identifier"], [4, 8, 2, "Identifier"]])
        },
        {
            code: `\
function foo() {
    const template = \`the indentation of
a curly element in a \${
        node.type
    } node is checked.\`;
}`,
            output: `\
function foo() {
    const template = \`the indentation of
a curly element in a \${
    node.type
} node is checked.\`;
}`,
            errors: expectedErrors([[4, 4, 8, "Identifier"], [5, 0, 4, "Template"]]),
            parserOptions: { ecmaVersion: 6 }
        },
        {
            code: `\
function foo() {
    const template = \`this time the
closing curly is at the end of the line \${
            foo}
        so the spaces before this line aren't removed.\`;
}`,
            output: `\
function foo() {
    const template = \`this time the
closing curly is at the end of the line \${
    foo}
        so the spaces before this line aren't removed.\`;
}`,
            errors: expectedErrors([4, 4, 12, "Identifier"]),
            parserOptions: { ecmaVersion: 6 }
        },
        {

            // https://github.com/eslint/eslint/issues/1801
            // Note: This issue also mentioned checking the indentation for the 2 below. However,
            // this is intentionally ignored because everyone seems to have a different idea of how
            // BinaryExpressions should be indented.
            code: `\
if (true) {
    a = (
1 +
        2);
}`,
            output: `\
if (true) {
    a = (
        1 +
        2);
}`,
            errors: expectedErrors([3, 8, 0, "Numeric"])
        },
        {

            // https://github.com/eslint/eslint/issues/3737
            code: `\
if (true) {
    for (;;) {
      b();
  }
}`,
            output: `\
if (true) {
  for (;;) {
    b();
  }
}`,
            options: [2],
            errors: expectedErrors([[2, 2, 4, "Keyword"], [3, 4, 6, "Identifier"]])
        },
        {

            // https://github.com/eslint/eslint/issues/6670
            code: `\
function f() {
    return asyncCall()
    .then(
               'some string',
              [
              1,
         2,
                                   3
                      ]
);
 }`,
            output: `\
function f() {
    return asyncCall()
        .then(
            'some string',
            [
                1,
                2,
                3
            ]
        );
}`,
            options: [4, { MemberExpression: 1, CallExpression: { arguments: 1 } }],
            errors: expectedErrors([
                [3, 8, 4, "Punctuator"],
                [4, 12, 15, "String"],
                [5, 12, 14, "Punctuator"],
                [6, 16, 14, "Numeric"],
                [7, 16, 9, "Numeric"],
                [8, 16, 35, "Numeric"],
                [9, 12, 22, "Punctuator"],
                [10, 8, 0, "Punctuator"],
                [11, 0, 1, "Punctuator"]
            ])
        },

        // https://github.com/eslint/eslint/issues/7242
        {
            code: `\
var x = [
      [1],
  [2]
]`,
            output: `\
var x = [
    [1],
    [2]
]`,
            errors: expectedErrors([[2, 4, 6, "Punctuator"], [3, 4, 2, "Punctuator"]])
        },
        {
            code: `\
var y = [
      {a: 1},
  {b: 2}
]`,
            output: `\
var y = [
    {a: 1},
    {b: 2}
]`,
            errors: expectedErrors([[2, 4, 6, "Punctuator"], [3, 4, 2, "Punctuator"]])
        },
        {
            code: `\
echo = spawn('cmd.exe',
            ['foo', 'bar',
             'baz']);`,
            output: `\
echo = spawn('cmd.exe',
             ['foo', 'bar',
             'baz']);`,
            options: [2, { ArrayExpression: "first", CallExpression: { arguments: "first" } }],
            errors: expectedErrors([[2, 13, 12, "Punctuator"]])
        },
        {

            // https://github.com/eslint/eslint/issues/7522
            code: `\
foo(
  )`,
            output: `\
foo(
)`,
            errors: expectedErrors([2, 0, 2, "Punctuator"])
        },
        {

            // https://github.com/eslint/eslint/issues/7616
            code: `\
foo(
        bar,
    {
        baz: 1
    }
)`,
            output: `\
foo(
        bar,
        {
            baz: 1
        }
)`,
            options: [4, { CallExpression: { arguments: "first" } }],
            errors: expectedErrors([[3, 8, 4, "Punctuator"], [4, 12, 8, "Identifier"], [5, 8, 4, "Punctuator"]])
        },
        {
            code: "  new Foo",
            output: "new Foo",
            errors: expectedErrors([1, 0, 2, "Keyword"])
        },
        {
            code: `\
export {
foo,
        bar,
  baz
}`,
            output: `\
export {
    foo,
    bar,
    baz
}`,
            parserOptions: { sourceType: "module" },
            errors: expectedErrors([[2, 4, 0, "Identifier"], [3, 4, 8, "Identifier"], [4, 4, 2, "Identifier"]])
        }
    ]
});
