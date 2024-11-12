import themes from '@onefootprint/design-tokens';
import type { Decorator, Preview } from '@storybook/react';
import { useEffect } from 'react';
import { DesignSystemProvider } from '../src/utils/design-system-provider';
import i18n from './i18n';
import '../src/styles/tailwind.css';

const StoryDecorator: Decorator = (Story, context) => {
  const { locale, theme } = context.globals;

  // When the locale global changes
  // Set the new locale in i18n
  useEffect(() => {
    if (locale) {
      i18n.changeLanguage(locale);
    }
  }, [locale]);

  useEffect(() => {
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    // here catches the suspense from components not yet ready (still loading translations)
    // alternative set useSuspense false on i18next.options.react when initializing i18next
    <DesignSystemProvider theme={themes[theme as keyof typeof themes]}>
      <Story />
    </DesignSystemProvider>
  );
};
export const decorators = [StoryDecorator];

const preview: Preview = {
  //👇 Enables auto-generated documentation for all stories
  tags: ['autodocs'],
  globalTypes: {
    locale: {
      name: 'Language',
      description: 'Internationalization',
      toolbar: {
        title: 'Language',
        icon: 'globe',
        dynamicTitle: true,
        items: [
          { value: 'en', right: '🇺🇸', title: 'English' },
          { value: 'es', right: '🇪🇸', title: 'Español' },
        ],
      },
    },
    theme: {
      name: 'Theme',
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        dynamicTitle: true,
        items: [
          { value: 'light', right: '🌞', title: 'Light' },
          { value: 'dark', right: '🌙', title: 'Dark' },
        ],
      },
    },
  },
  initialGlobals: {
    locale: 'en',
    theme: 'light',
  },
};

export default preview;
