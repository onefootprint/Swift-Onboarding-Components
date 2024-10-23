import themes from '@onefootprint/design-tokens';
import type { Decorator, Preview } from '@storybook/react';
import { DesignSystemProvider } from '@onefootprint/ui';
import noop from 'lodash/noop';
import Script from 'next/script';
import { useEffect } from 'react';
import { Layout as AppLayout } from '../src';
import { L10nContextProvider } from '../src/components/l10n-provider';
import { MachineProvider } from '../src/components/machine-provider';
import { GOOGLE_MAPS_SRC } from '../src/config/constants';
import i18n from '../src/config/initializers/i18next-test';
import { viewports } from './viewports';

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
      <DesignSystemProvider theme={themes.light}>
        <L10nContextProvider>
          <AppLayout
            onClose={noop}
            variant="inline"
            isSandbox={true}
            options={{
              hideDesktopSandboxBanner: true,
              hideDesktopFooter: true,
              hasDesktopBorderRadius: true,
            }}
          >
            <MachineProvider args={{}}>
              <Story />
            </MachineProvider>
          </AppLayout>
        </L10nContextProvider>
      </DesignSystemProvider>
      {GOOGLE_MAPS_SRC ? <Script src={GOOGLE_MAPS_SRC} async strategy="lazyOnload" /> : null}
    </>
  );
};

export const decorators = [StoryDecorator];

const preview: Preview = {
  parameters: {
    chromatic: {
      modes: {
        mobile: { viewport: 'smallMobile' },
        default: { viewport: 'default' },
      },
    },
    viewport: {
      defaultViewport: 'default',
      viewports,
    },
  },
};

export default preview;
