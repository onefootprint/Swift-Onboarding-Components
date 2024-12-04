import type { Meta, StoryObj } from '@storybook/react';

import Banner from './banner';

const meta: Meta<typeof Banner> = {
  component: Banner,
  title: 'Components/Banner',
  args: {
    variant: 'info',
  },
  argTypes: {
    variant: {
      control: 'select',
      description: 'Visual style and intent of the banner',
      options: ['info', 'error', 'warning', 'announcement'],
    },
    children: {
      control: 'text',
      description: 'Content to be rendered inside the banner',
    },
  },
  parameters: {
    docs: {
      description: {
        component: 'Banner is a component used to display important messages, alerts, or announcements to users.',
      },
    },
  },
};

type Story = StoryObj<typeof Banner>;

export const ErrorVariant: Story = {
  name: 'Error',
  args: {
    children: 'This is an error message that requires immediate attention.',
    variant: 'error',
  },
};

export const Warning: Story = {
  args: {
    children: 'This is a warning message you should be aware of.',
    variant: 'warning',
  },
};

export const Info: Story = {
  args: {
    children: 'This is an informational message.',
    variant: 'info',
  },
};

export const Announcement: Story = {
  args: {
    children: 'This is an announcement or promotional message.',
    variant: 'announcement',
  },
};

export const WithLink: Story = {
  args: {
    children: (
      <>
        This message contains a <a href="/">clickable link</a> for more details.
      </>
    ),
    variant: 'error',
  },
};

export const WithButton: Story = {
  args: {
    children: (
      <>
        This message contains an action.{' '}
        <button type="button" onClick={() => alert('Clicked!')}>
          Click here
        </button>
      </>
    ),
    variant: 'info',
  },
};

export default meta;
