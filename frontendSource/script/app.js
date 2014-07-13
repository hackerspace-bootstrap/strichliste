var foo = require('./lib/foo');
var angular = require('./lib/angular');
var $ = require('./lib/jquery');

console.log( 'welcome, the app has been bootstrapped: ' + foo() );

console.log( 'i present you angular: ', angular);
console.log( 'i present you jquery: ', $ );