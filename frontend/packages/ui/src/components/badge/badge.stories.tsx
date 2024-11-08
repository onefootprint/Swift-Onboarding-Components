import type { Meta, StoryObj } from '@storybook/react';

import Badge from './badge';

const meta: Meta<typeof Badge> = {
  component: Badge,
  title: 'Components/Badge',
  args: {
    variant: 'neutral',
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'The visual style of the badge. Choose from standard colors or their inverted versions.',
      options: [
        'accent',
        'error',
        'info',
        'neutral',
        'success',
        'warning',
        'successInverted',
        'warningInverted',
        'errorInverted',
        'infoInverted',
        'neutralInverted',
      ],
    },
    children: {
      control: 'text',
      description: 'The content to be displayed inside the badge.',
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Badge is a component used to highlight or label content with a colored background. It can be used to show status, categories, or other metadata.',
      },
    },
  },
};

type Story = StoryObj<typeof Badge>;

export const Accent: Story = {
  args: {
    children: 'Accent',
    variant: 'accent',
  },
};

export const ErrorV: Story = {
  args: {
    children: 'Error',
    variant: 'error',
  },
};

export const Info: Story = {
  args: {
    children: 'Info',
    variant: 'info',
  },
};

export const Neutral: Story = {
  args: {
    children: 'Neutral',
    variant: 'neutral',
  },
};

export const Success: Story = {
  args: {
    children: 'Success',
    variant: 'success',
  },
};

export const Warning: Story = {
  args: {
    children: 'Warning',
    variant: 'warning',
  },
};

export const SuccessInverted: Story = {
  args: {
    children: 'Success Inverted',
    variant: 'successInverted',
  },
};

export const WarningInverted: Story = {
  args: {
    children: 'Warning Inverted',
    variant: 'warningInverted',
  },
};

export const ErrorInverted: Story = {
  args: {
    children: 'Error Inverted',
    variant: 'errorInverted',
  },
};

export const InfoInverted: Story = {
  args: {
    children: 'Info Inverted',
    variant: 'infoInverted',
  },
};

export const NeutralInverted: Story = {
  args: {
    children: 'Neutral Inverted',
    variant: 'neutralInverted',
  },
};

export default meta;
