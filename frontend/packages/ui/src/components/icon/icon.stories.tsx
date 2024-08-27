import themes from '@onefootprint/design-tokens';
import { IcoChevronDown16, icos } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';

import Box from '../box';
import Stack from '../stack';
import Text from '../text';

export default {
  title: 'Components/Icon',
  component: IcoChevronDown16,
  argTypes: {
    color: {
      control: 'select',
      options: Object.keys(themes.light.color),
    },
    testID: { control: 'text' },
  },
} satisfies Meta<typeof IcoChevronDown16>;

export const AllIcons: StoryFn<typeof IcoChevronDown16> = ({ color, testID }) => (
  <Box>
    <Box marginBottom={10}>
      <Text color="primary" variant="heading-2" marginBottom={3}>
        Icos
      </Text>
      {Object.keys(icos).map(iconName => {
        // @ts-ignore
        const IcoComponent = icos[iconName];
        return (
          <>
            <Stack align="center" marginBottom={2}>
              <Box minWidth="32px">
                <IcoComponent color={color} testID={testID} />
              </Box>
              <Text variant="body-2" color="primary">
                {iconName}
              </Text>
            </Stack>
            <hr />
          </>
        );
      })}
    </Box>
  </Box>
);
