/**
 * Open Issue importing from validator/es/
 * @see https://github.com/validatorjs/validator.js/issues/1759
 *
 * Collecting page data  ...frontend/node_modules/validator/es/lib/isEmail.js:1
 * import assertString from './util/assertString';
 * SyntaxError: Cannot use import statement outside a module
 */
import isEmail from 'validator/lib/isEmail'; // import isEmail from 'validator/es/lib/isEmail';

export default isEmail;
