import { IcoInfo16 } from '@onefootprint/icons';
import { Meta, Story } from '@storybook/react';
import React from 'react';
import styled from 'styled-components';

import Tooltip from './tooltip';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    content: {
      control: 'text',
      description: 'Tooltip content',
      required: true,
    },
    position: {
      control: {
        type: 'select',
        options: ['top', 'bottom', 'left', 'right'],
      },
      description: 'Tooltip position',
      table: { defaultValue: { summary: 'top' } },
    },
    alignment: {
      control: {
        type: 'select',
        options: ['start', 'center', 'end'],
      },
      description: 'Tooltip alignment',
      table: { defaultValue: { summary: 'center' } },
    },

    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as Meta;

const Template: Story = ({
  position,
  alignment,
  content,
  children,
  onOpenChange,
}) => (
  <Aligner>
    <Tooltip
      position={position}
      alignment={alignment}
      text={content}
      onOpenChange={onOpenChange}
    >
      {children}
    </Tooltip>
  </Aligner>
);

export const Default = Template.bind({});
Default.args = {
  content: 'Tooltip content',
  position: 'top',
  alignment: 'center',
  children: <IcoInfo16 />,
  onOpenChange: () => null,
};

const Aligner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
