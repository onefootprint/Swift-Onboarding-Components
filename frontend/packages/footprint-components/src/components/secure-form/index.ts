// Child frame needs to call initSecureFormChild and render SecureFormChild
// Parent frame needs to render SecureForm
export { default as SecureFormChild } from './secure-form';
export * from './types';
export { initSecureFormChild, SecureFormWidget as SecureForm } from './widget';
