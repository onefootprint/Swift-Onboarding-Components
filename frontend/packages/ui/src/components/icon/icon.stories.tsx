import themes from '@onefootprint/design-tokens';
import { IcoChevronDown16, icos } from '@onefootprint/icons';
import type { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';

import Box from '../box';
import Stack from '../stack';
import Typography from '../typography';

export default {
  title: 'Components/Icon',
  component: IcoChevronDown16,
  argTypes: {
    color: { control: 'select', options: Object.keys(themes.light.color) },
    testID: { control: 'text' },
  },
} as ComponentMeta<typeof IcoChevronDown16>;

export const AllIcons: ComponentStory<typeof IcoChevronDown16> = ({
  color,
  testID,
}) => (
  <Box>
    <Box marginBottom={10}>
      <Typography color="primary" variant="heading-2" sx={{ marginBottom: 3 }}>
        Icos
      </Typography>
      {Object.keys(icos).map(iconName => {
        // @ts-ignore
        const IcoComponent = icos[iconName];
        return (
          <>
            <Stack align="center" marginBottom={2}>
              <Box minWidth="32px">
                <IcoComponent color={color} testID={testID} />
              </Box>
              <Typography variant="body-2" color="primary">
                {iconName}
              </Typography>
            </Stack>
            <hr />
          </>
        );
      })}
    </Box>
  </Box>
);
