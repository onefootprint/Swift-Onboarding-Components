import { ComponentMeta, ComponentStory } from '@storybook/react';
import { flags, icos } from 'icons';
import IcoChevronDown16 from 'icons/ico/ico-chevron-down-16';
import React from 'react';
import { withDesign } from 'storybook-addon-designs';

import light from '../../config/themes/light';
import Box from '../box';
import Typography from '../typography';

export default {
  title: 'Components/Icon',
  component: IcoChevronDown16,
  argTypes: {
    color: { control: 'select', options: Object.keys(light.color) },
    testID: { control: 'text' },
  },
  decorators: [withDesign],
} as ComponentMeta<typeof IcoChevronDown16>;

export const AllIcons: ComponentStory<typeof IcoChevronDown16> = ({
  color,
  testID,
}) => (
  <Box>
    <Box sx={{ marginBottom: 10 }}>
      <Typography color="primary" variant="heading-2" sx={{ marginBottom: 3 }}>
        Icos
      </Typography>
      {Object.keys(icos).map(iconName => {
        // @ts-ignore
        const IcoComponent = icos[iconName];
        return (
          <>
            <Box
              sx={{
                display: 'flex',
                marginBottom: 2,
                alignItems: 'center',
              }}
            >
              <Box sx={{ minWidth: '32px' }}>
                <IcoComponent color={color} testID={testID} />
              </Box>
              <Typography variant="body-2" color="primary">
                {iconName}
              </Typography>
            </Box>
            <hr />
          </>
        );
      })}
    </Box>
    <Box>
      <Typography color="primary" variant="heading-2" sx={{ marginBottom: 3 }}>
        Flags
      </Typography>
      {Object.keys(flags).map(flagName => {
        // @ts-ignore
        const IcoComponent = flags[flagName];
        return (
          <>
            <Box
              sx={{
                display: 'flex',
                marginBottom: 2,
                alignItems: 'center',
              }}
            >
              <Box sx={{ minWidth: '32px' }}>
                <IcoComponent color={color} testID={testID} />
              </Box>
              <Typography variant="body-2" color="primary">
                {flagName}
              </Typography>
            </Box>
            <hr />
          </>
        );
      })}
    </Box>
  </Box>
);

AllIcons.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/ezOPgNR1iPizwCOB607XyX/Icons-%2B-Logos?node-id=1%3A7',
  },
};
