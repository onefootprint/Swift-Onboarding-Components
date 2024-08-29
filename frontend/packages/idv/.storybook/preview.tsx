import themes from '@onefootprint/design-tokens';
import { media } from '@onefootprint/ui';
import type { Decorator, Preview } from '@storybook/react';
import Script from 'next/script';
import { useEffect } from 'react';
import { ThemeProvider, createGlobalStyle, css } from 'styled-components';
import { L10nContextProvider } from '../src/components/l10n-provider';
import { MachineProvider } from '../src/components/machine-provider';
import { GOOGLE_MAPS_SRC } from '../src/config/constants';
import i18n from '../src/config/initializers/i18next-test';

// Create a global variable called locale in storybook
// and add a dropdown in the toolbar to change your locale
export const globalTypes = {
  locale: {
    name: 'Language',
    description: 'Internationalization',
    toolbar: {
      title: 'Language',
      icon: 'globe',
      items: [
        { value: 'en', title: 'English' },
        { value: 'es', title: 'Español' },
      ],
    },
  },
};

const StoryDecorator: Decorator = (Story, context) => {
  const { locale } = context.globals;

  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    <>
      <ThemeProvider theme={themes.light}>
        <div id="footprint-portal" />
        <div id="footprint-toast-portal" />
        <L10nContextProvider>
          <MachineProvider args={{}}>
            <GlobalStyle />
            <Story />
          </MachineProvider>
        </L10nContextProvider>
      </ThemeProvider>
      {GOOGLE_MAPS_SRC ? <Script src={GOOGLE_MAPS_SRC} async strategy="lazyOnload" /> : null}
    </>
  );
};

const GlobalStyle = createGlobalStyle`
 ${({ theme }) => css`
   html {
     --navigation-header-height: 56px;
     --loading-container-min-height: 188px;
   }
   body {
     background: transparent;
   }
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
     font-family: ${theme.fontFamily.default};
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

export const decorators = [StoryDecorator];

const preview: Preview = {
  //👇 Enables auto-generated documentation for all stories
  parameters: {
    viewport: {
      defaultViewport: 'default',
      viewports: {
        mobile1: {
          name: 'Small mobile',
          styles: {
            height: '568px',
            width: '320px',
          },
          type: 'mobile',
        },
        default: {
          name: 'Default',
          styles: {
            width: '480px',
            height: '700px',
          },
        },
      },
    },
  },
};

export default preview;
