import themes from '@onefootprint/design-tokens';
import type { Decorator, Preview } from '@storybook/react';
import { useEffect } from 'react';
import { DesignSystemProvider } from '../src/utils/design-system-provider';
import i18n from './i18n';

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
    // here catches the suspense from components not yet ready (still loading translations)
    // alternative set useSuspense false on i18next.options.react when initializing i18next
    <DesignSystemProvider theme={themes.light}>
      <Story />
    </DesignSystemProvider>
  );
};
export const decorators = [StoryDecorator];

const preview: Preview = {
  //👇 Enables auto-generated documentation for all stories
  tags: ['autodocs'],
};

export default preview;
