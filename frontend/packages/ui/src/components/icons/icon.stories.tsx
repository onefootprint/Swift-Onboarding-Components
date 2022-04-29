import { ComponentMeta, ComponentStory } from '@storybook/react';
import React from 'react';
import { withDesign } from 'storybook-addon-designs';

import light from '../../config/themes/light';
import Typography from '../typography';
import Icos from './ico';
import IcoChevronDown16 from './ico/ico-chevron-down-16';

export default {
  title: 'Components/Icon',
  component: IcoChevronDown16,
  argTypes: {
    color: { control: 'select', options: Object.keys(light.colors) },
    testID: { control: 'text' },
  },
  decorators: [withDesign],
} as ComponentMeta<typeof IcoChevronDown16>;

export const AllIcons: ComponentStory<typeof IcoChevronDown16> = ({
  color,
  testID,
}) => (
  <>
    {Object.keys(Icos).map(iconName => {
      // @ts-ignore
      const IcoComponent = Icos[iconName];
      return (
        <>
          <div
            style={{
              display: 'flex',
              marginBottom: '4px',
              alignItems: 'center',
            }}
          >
            <div style={{ width: '32px' }}>
              <IcoComponent color={color} testID={testID} />
            </div>
            <Typography variant="body-2" color="primary">
              {iconName}
            </Typography>
          </div>
          <hr />
        </>
      );
    })}
  </>
);

AllIcons.parameters = {
  design: {
    type: 'figma',
    url: 'https://www.figma.com/file/ezOPgNR1iPizwCOB607XyX/Icons-%2B-Logos?node-id=1%3A7',
  },
};
