import type { Theme } from '@onefootprint/design-tokens';
import React from 'react';
import { ThemeProvider, createGlobalStyle, css } from 'styled-components';

import ToastProvider from '../../components/toast/toast-provider';
import ConfirmationDialogProvider from '../confirmation-dialog-provider';
import media from '../media';

export type BootstrapProps = {
  children: React.ReactNode;
  theme: Theme;
};

const GlobalStyle = createGlobalStyle`
 ${({ theme }) => css`
   html,
   body,
   div,
   span,
   applet,
   object,
   iframe,
   h1,
   h2,
   h3,
   h4,
   h5,
   h6,
   p,
   blockquote,
   a,
   abbr,
   acronym,
   address,
   big,
   cite,
   del,
   dfn,
   em,
   img,
   ins,
   kbd,
   q,
   s,
   samp,
   small,
   strike,
   strong,
   sub,
   sup,
   tt,
   var,
   b,
   u,
   i,
   center,
   dl,
   dt,
   dd,
   menu,
   ol,
   ul,
   li,
   fieldset,
   form,
   label,
   legend,
   table,
   caption,
   tbody,
   tfoot,
   thead,
   tr,
   th,
   td,
   article,
   aside,
   canvas,
   details,
   embed,
   figure,
   figcaption,
   footer,
   header,
   hgroup,
   main,
   menu,
   nav,
   output,
   ruby,
   section,
   summary,
   time,
   mark,
   audio,
   video {
     margin: 0;
     padding: 0;
     border: 0;
     font-size: 100%;
     vertical-align: baseline;
     font-family: ${
       theme.fontFamily.default === 'DM Sans'
         ? `var(--font-dm-sans, ${theme.fontFamily.default})`
         : theme.fontFamily.default
     };
   }
   code,
   pre {
     margin: 0;
     padding: 0;
     border: 0;
     font-family: ${theme.fontFamily.code};
     font-size: 100%;
     vertical-align: baseline;
   }
   code > * > *,
   pre > * > * {
     font-family: ${theme.fontFamily.code};
   }
   /* HTML5 display-role reset for older browsers */
   article,
   aside,
   details,
   figcaption,
   figure,
   footer,
   header,
   hgroup,
   main,
   menu,
   nav,
   section {
     display: block;
   }
   /* HTML5 hidden-attribute fix for newer browsers */
   *[hidden] {
     display: none;
   }
   body {
     line-height: 1;
   }
   menu,
   ol,
   ul {
     list-style: none;
   }
   blockquote,
   q {
     quotes: none;
   }
   blockquote:before,
   blockquote:after,
   q:before,
   q:after {
     content: '';
     content: none;
   }
   table {
     border-collapse: collapse;
     border-spacing: 0;
   }

   *,
   :after,
   :before {
     box-sizing: border-box;
     -webkit-font-smoothing: antialiased;
     -moz-osx-font-smoothing: grayscale;
   }

   html {
     font-size: clamp(16px, 4.35vw, 18px);

     ${media.greaterThan('md')`
      font-size: clamp(14px, 2vw, 16px);
    `}
   }

   body {
     background-color: ${theme.backgroundColor.primary};
   }
 `}
`;

// TODO: Move flags to a dedicated CDN
// https://github.com/rafaelmotta/footprint-flags
const DesignSystemProvider = ({ children, theme }: BootstrapProps) => (
  <ThemeProvider theme={theme}>
    <GlobalStyle />
    <ConfirmationDialogProvider>
      <ToastProvider>{children}</ToastProvider>
    </ConfirmationDialogProvider>
    <div id="footprint-portal" />
    <div id="footprint-toast-portal" />
    {process.env.NODE_ENV === 'test' ? null : (
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/rafaelmotta/footprint-flags/sprite.css" />
    )}
  </ThemeProvider>
);

export default DesignSystemProvider;
