/* eslint-disable no-alert */
import {
  IcoArrowRightSmall24,
  IcoPlusSmall24,
  icos,
} from '@onefootprint/icons';
import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import type { LinkButtonProps } from './link-button';
import LinkButton from './link-button';
import { sizes, variants } from './link-button.constants';

export default {
  title: 'Components/LinkButton',
  component: LinkButton,
  argTypes: {
    ariaLabel: {
      control: 'text',
      description:
        'Aria Label for accessibility. It uses by the default the children content',
      name: 'aria-label',
      required: false,
    },
    children: {
      control: 'text',
      description: 'Text content',
      name: 'children *',
    },
    href: { control: 'text', description: 'Creates a hyperlink to web pages' },
    iconComponent: {
      control: 'select',
      description: 'Icon to be rendered',
      options: Object.keys(icos),
    },
    iconPosition: {
      control: 'select',
      description: 'Where the Icon should be placed',
      options: ['left', 'right'],
      table: { defaultValue: { summary: 'right' } },
    },
    onClick: {
      control: 'object',
      description: 'Callback function triggered upon click',
    },
    size: {
      control: 'select',
      description: 'Size',
      options: sizes,
      table: { defaultValue: { summary: 'default' } },
    },
    target: {
      control: 'select',
      description: 'Where the browser should load the link',
      options: ['_blank', '_self', '_parent', '_top', 'framename'],
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    variant: {
      control: 'select',
      description: 'Variant style',
      options: variants,
      table: { defaultValue: { summary: 'default' } },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the button is disabled',
    },
  },
} as ComponentMeta<typeof LinkButton>;

const Template: Story<LinkButtonProps> = ({
  ariaLabel,
  children,
  href,
  iconComponent: Icon,
  iconPosition,
  onClick,
  size,
  target,
  testID,
  variant,
  disabled,
}: LinkButtonProps) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return (
    <LinkButton
      ariaLabel={ariaLabel}
      href={href}
      iconComponent={SelectedIcon}
      iconPosition={iconPosition}
      onClick={onClick}
      size={size}
      target={target}
      testID={testID}
      variant={variant}
      disabled={disabled}
    >
      {children}
    </LinkButton>
  );
};

export const AsLink = Template.bind({});
AsLink.args = {
  ariaLabel: 'Link button',
  children: 'Link button',
  href: 'https://onefootprint.com',
  iconComponent: IcoArrowRightSmall24,
  iconPosition: 'right',
  size: 'default',
  target: '_blank',
  testID: 'link-button-test-id',
  variant: 'default',
  disabled: false,
};

export const Base = Template.bind({});
Base.args = {
  children: 'Link button',
  onClick: () => alert('I was pressed'),
  size: 'default',
};

export const BaseSize1 = Template.bind({});
BaseSize1.args = {
  children: 'Link button',
  onClick: () => alert('I was pressed'),
  size: 'compact',
};

export const BaseSize2 = Template.bind({});
BaseSize2.args = {
  children: 'Link button',
  onClick: () => alert('I was pressed'),
  size: 'tiny',
};

export const BaseSize3 = Template.bind({});
BaseSize3.args = {
  children: 'Link button',
  onClick: () => alert('I was pressed'),
  size: 'xTiny',
};

export const WithIconLeft = Template.bind({});
WithIconLeft.args = {
  children: 'Link button',
  iconComponent: IcoPlusSmall24,
  iconPosition: 'left',
  onClick: () => alert('I was pressed'),
  size: 'default',
};

export const WithIconRight = Template.bind({});
WithIconRight.args = {
  children: 'Link button',
  iconComponent: IcoPlusSmall24,
  iconPosition: 'right',
  onClick: () => alert('I was pressed'),
  size: 'default',
};
