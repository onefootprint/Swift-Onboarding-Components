import { IcoInfo16 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
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
    disabled: {
      control: 'boolean',
      description: 'Disable tooltip',
      required: false,
    },
    open: {
      control: 'boolean',
      description: 'Control open tooltip',
      required: false,
    },
    onOpenChange: {
      control: 'boolean',
      description: 'Control open tooltip',
      required: false,
    },
  },
} as Meta;

const Template: StoryFn = ({ position, alignment, content, children, disabled, open, onOpenChange }) => (
  <Aligner>
    <Tooltip
      position={position}
      alignment={alignment}
      text={content}
      disabled={disabled}
      open={open}
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
};

const Aligner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
