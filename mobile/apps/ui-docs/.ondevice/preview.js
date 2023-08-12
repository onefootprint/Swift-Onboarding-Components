import themes from '@onefootprint/design-tokens';
import { DesignSystemProvider } from '@onefootprint/ui';
import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds';
import { View } from 'react-native';

export const decorators = [
  withBackgrounds,
  Story => {
    return (
      <DesignSystemProvider theme={themes.light}>
        <Story />
      </DesignSystemProvider>
    );
  },
  Story => (
    <View style={{ margin: 8 }}>
      <Story />
    </View>
  ),
];

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
