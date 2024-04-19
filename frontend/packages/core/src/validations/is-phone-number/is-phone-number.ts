/**
 * Open Issue importing from validator/es/
 * @see https://github.com/validatorjs/validator.js/issues/1759
 *
 * Collecting page data  ...node_modules/validator/es/lib/isMobilePhone.js:1
 * import assertString from './util/assertString';
 * SyntaxError: Cannot use import statement outside a module
 */
import isPhoneNumber from 'validator/lib/isMobilePhone'; // import isPhoneNumber from 'validator/es/lib/isMobilePhone';

export default isPhoneNumber;
