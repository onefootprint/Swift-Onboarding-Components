import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { initialize, mswLoader } from 'msw-storybook-addon';

import configureReactI18next from '../src/config/initializers/react-i18next';
import ReactQueryProvider from '../src/config/initializers/react-query-provider';

initialize({
  serviceWorker: {
    url: '/mockServiceWorker.js',
  },
});

configureReactI18next();

const StoryDecorator = Story => {
  return (
    <DesignSystemProvider theme={themes.light}>
      <ReactQueryProvider>
        <Story />
      </ReactQueryProvider>
    </DesignSystemProvider>
  );
};

export const decorators = [StoryDecorator];

const preview = {
  //👇 Enables auto-generated documentation for all stories
  tags: ['autodocs'],
  loaders: [mswLoader],
};

export default preview;
