import React, { useEffect, Suspense } from 'react';
import i18n from './i18n';
import { DesignSystemProvider } from '../src/utils/design-system-provider';
import themes from '@onefootprint/design-tokens';

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

const StoryDecorator = (Story, context) => {
  const { locale } = context.globals;

  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  return (
    // here catches the suspense from components not yet ready (still loading translations)
    // alternative set useSuspense false on i18next.options.react when initializing i18next
    <DesignSystemProvider theme={themes.footprint.light}>
      <Story />
    </DesignSystemProvider>
  );
};

// export decorators for storybook to wrap your stories in
export const decorators = [StoryDecorator];
