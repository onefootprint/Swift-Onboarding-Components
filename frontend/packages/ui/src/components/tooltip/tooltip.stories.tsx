import { IcoInfo16 } from '@onefootprint/icons';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import { waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Radio } from '../../';
import Tooltip from './tooltip';

type Story = StoryObj<typeof Tooltip>;
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
    boundary: {
      control: 'text',
      description: 'Boundary element for collision detection',
      required: false,
    },
  },
} as Meta<typeof Tooltip>;

const Template: StoryFn<typeof Tooltip> = ({ disabled, text, position, alignment, collisionBoundary, children }) => (
  <div className="flex items-center justify-center h-screen">
    <Tooltip
      disabled={disabled}
      text={text}
      position={position}
      alignment={alignment}
      collisionBoundary={collisionBoundary}
    >
      {children}
    </Tooltip>
  </div>
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

export const OnDisabledComponent = Template.bind({});
OnDisabledComponent.args = {
  text: 'Tooltip content',
  children: <Radio disabled label="radio-label" />,
};

export const TooltipInteraction: Story = {
  ...Default,
  play: async ({ step }) => {
    const body = within(document.body);
    const triggerButton = body.getByRole('button');

    await step('Open the tooltip by hovering', async () => {
      await userEvent.hover(triggerButton);
      const tooltip = await body.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    await step('Close the tooltip by unhovering', async () => {
      await userEvent.unhover(triggerButton);
      await waitFor(() => {
        const tooltip = body.queryByRole('tooltip');
        expect(tooltip).not.toBeInTheDocument();
      });
    });

    await step('Open tooltip by clicking', async () => {
      await userEvent.click(triggerButton);
      const tooltip = await body.findByRole('tooltip');
      expect(tooltip).toBeInTheDocument();
    });

    await step('Close tooltip by clicking again', async () => {
      await userEvent.click(triggerButton);
      await userEvent.click(triggerButton);
      await waitFor(() => {
        const tooltip = body.queryByRole('tooltip');
        expect(tooltip).not.toBeInTheDocument();
      });
    });
  },
};
