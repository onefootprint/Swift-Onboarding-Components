// Child frame needs to call initSecureRenderChild and render SecureRenderChild
// Parent frame needs to render SecureRender
export { default as SecureRenderChild } from './secure-render';
export * from './types';
export { initSecureRenderChild, SecureRenderWidget } from './widget';
