import { IcoInfo16 } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';
import styled from 'styled-components';

import { Radio } from '../../';
import Tooltip from './tooltip';

export default {
  title: 'Components/Tooltip',
  component: Tooltip,
  argTypes: {
    text: {
      control: 'text',
      description: 'Tooltip text',
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
      action: 'onOpenChange',
      description: 'Callback when tooltip open state changes',
    },
    boundary: {
      control: 'text',
      description: 'Boundary element for collision detection',
      required: false,
    },
  },
} as Meta<typeof Tooltip>;

const Template: StoryFn<typeof Tooltip> = ({
  disabled,
  text,
  position,
  alignment,
  open,
  onOpenChange,
  collisionBoundary,
  children,
}) => (
  <Aligner>
    <Tooltip
      disabled={disabled}
      text={text}
      position={position}
      alignment={alignment}
      open={open}
      onOpenChange={onOpenChange}
      collisionBoundary={collisionBoundary}
    >
      {children}
    </Tooltip>
  </Aligner>
);

export const Default = Template.bind({});
Default.args = {
  text: 'Tooltip content',
  children: <IcoInfo16 color="primary" />,
};

export const Disabled = Template.bind({});
Disabled.args = {
  text: 'Tooltip content',
  disabled: true,
  children: <IcoInfo16 color="quaternary" />,
};

export const Mobile = Template.bind({});
Mobile.args = {
  text: 'Tooltip content',
  children: <IcoInfo16 color="primary" />,
};

export const OnDisabledComponent = Template.bind({});
OnDisabledComponent.args = {
  text: 'Tooltip content',
  children: <Radio disabled label="radio-label" />,
};

const Aligner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100vh;
`;
