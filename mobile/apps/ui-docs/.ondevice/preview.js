import { withBackgrounds } from '@storybook/addon-ondevice-backgrounds';
import { DesignSystemProvider } from '@onefootprint/ui';
import themes from '@onefootprint/design-tokens';
import { View } from 'react-native';
import {
  useFonts,
  DMSans_400Regular,
  DMSans_500Medium,
  DMSans_700Bold,
} from '@expo-google-fonts/dm-sans';

export const decorators = [
  withBackgrounds,
  Story => {
    const [fontsLoaded] = useFonts({
      DMSans_400Regular,
      DMSans_500Medium,
      DMSans_700Bold,
    });

    return fontsLoaded ? (
      <DesignSystemProvider theme={themes.light}>
        <Story />
      </DesignSystemProvider>
    ) : null;
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
