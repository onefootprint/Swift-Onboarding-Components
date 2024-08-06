import type { Meta, Story } from '@storybook/react';
import styled from 'styled-components';

import type { CopyButtonProps } from './copy-button';
import CopyButton from './copy-button';

export default {
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
    tooltipPosition: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Tooltip position',
      required: false,
    },
    tooltipText: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Tooltip text',
    },
    tooltipTextConfirmation: {
      control: {
        type: 'text',
      },
      type: { name: 'string', required: false },
      description: 'Confirmation tooltip text',
    },
    contentToCopy: {
      control: 'text',
      description: 'Content to be copied',
      required: true,
    },
  },
} as Meta;

const Template: Story<CopyButtonProps> = ({
  ariaLabel,
  children,
  contentToCopy,
  tooltipPosition,
  tooltipText,
  tooltipTextConfirmation,
  disable,
}: CopyButtonProps) => (
  <Container>
    <CopyButton
      ariaLabel={ariaLabel}
      tooltipText={tooltipText}
      tooltipPosition={tooltipPosition}
      tooltipTextConfirmation={tooltipTextConfirmation}
      contentToCopy={contentToCopy}
      disable={disable}
    >
      {children}
    </CopyButton>
  </Container>
);

export const Default = Template.bind({});
Default.args = {
  ariaLabel: 'Copy to clipboard',
  children: 'Copy me',
  contentToCopy: 'Copy me',
  tooltipPosition: 'right',
  tooltipText: 'Copy to clipboard',
  tooltipTextConfirmation: 'Copied!',
  disable: false,
};

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;
