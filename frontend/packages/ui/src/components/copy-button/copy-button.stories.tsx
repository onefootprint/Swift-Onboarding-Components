import type { Meta, StoryObj } from '@storybook/react';
import { useEffect } from 'react';
import styled from 'styled-components';
import type { CopyButtonProps } from './copy-button';
import CopyButton from './copy-button';

const meta: Meta<CopyButtonProps> = {
  component: CopyButton,
  title: 'Components/CopyButton',
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Copy to clipboard',
      required: false,
    },
    children: {
      control: 'text',
      description: 'Content to be displayed',
      required: false,
    },
    tooltip: {
      control: 'object',
      description: 'Tooltip configuration',
      required: false,
    },
    contentToCopy: {
      control: 'text',
      description: 'Content to be copied',
      required: true,
    },
    size: {
      control: 'select',
      options: ['compact', 'default', 'large'],
      description: 'Size of the copy button',
    },
    disable: {
      control: 'boolean',
      description: 'Disable the button',
    },
  },
};

export default meta;

type Story = StoryObj<typeof CopyButton>;

export const Default: Story = {
  args: {
    size: 'default',
    ariaLabel: 'Copy to clipboard',
    contentToCopy: 'Copy me',
    tooltip: {
      position: 'right',
      text: 'Copy to clipboard',
      textConfirmation: 'Copied!',
    },
    disable: false,
  },
  render: args => (
    <Container>
      <CopyButton {...args} />
    </Container>
  ),
};

export const DefaultActive: Story = {
  ...Default,
  parameters: { pseudo: { hover: true } },
  render: args => {
    useEffect(() => {
      document.querySelector<HTMLButtonElement>('button[aria-label="Copy to clipboard"]')?.focus();
    }, []);
    return (
      <Container>
        <CopyButton {...args} />
      </Container>
    );
  },
};

export const Disabled: Story = {
  ...Default,
  args: {
    ...Default.args,
    disable: true,
  },
};

export const WithChildren: Story = {
  args: {
    ...Default.args,
    children: 'Copy me',
  },
  render: args => (
    <Container>
      <CopyButton {...args}>{args.children}</CopyButton>
    </Container>
  ),
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;
