/* eslint-disable no-alert */
import { IcoArrowRightSmall24, icos } from '@onefootprint/icons';
import type { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import type { LinkButtonProps } from './link-button';
import LinkButton from './link-button';

const linkButtonVariants = [
  'body-1',
  'body-2',
  'body-3',
  'body-4',
  'label-1',
  'label-2',
  'label-3',
  'label-4',
  'caption-1',
  'caption-2',
  'caption-3',
  'caption-4',
  'snippet-1',
  'snippet-2',
  'snippet-3',
];

export default {
  title: 'Components/LinkButton',
  component: LinkButton,
  argTypes: {
    ariaLabel: {
      control: 'text',
      description: 'Aria Label for accessibility. It uses by the default the children content',
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
      options: linkButtonVariants,
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
  target,
  variant,
  disabled,
  destructive,
  $margin,
  $marginInline,
  $marginBlock,
  $marginBottom,
  $marginLeft,
  $marginRight,
  $marginTop,
  $padding,
  $paddingBottom,
  $paddingLeft,
  $paddingRight,
  $paddingTop,
  $paddingInline,
  $paddingBlock,
}: LinkButtonProps) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return (
    <LinkButton
      ariaLabel={ariaLabel}
      href={href}
      iconComponent={SelectedIcon}
      iconPosition={iconPosition}
      onClick={onClick}
      target={target}
      variant={variant}
      disabled={disabled}
      destructive={destructive}
      $margin={$margin}
      $marginInline={$marginInline}
      $marginBlock={$marginBlock}
      $marginBottom={$marginBottom}
      $marginLeft={$marginLeft}
      $marginRight={$marginRight}
      $marginTop={$marginTop}
      $padding={$padding}
      $paddingBottom={$paddingBottom}
      $paddingLeft={$paddingLeft}
      $paddingRight={$paddingRight}
      $paddingTop={$paddingTop}
      $paddingInline={$paddingInline}
      $paddingBlock={$paddingBlock}
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
  target: '_blank',
  variant: 'label-3',
  disabled: false,
};

export const Base = Template.bind({});
Base.args = {
  children: 'Link button',
  onClick: () => alert('I was pressed'),
};

export const WithSpacing = Template.bind({});
WithSpacing.args = {
  children: 'Link button',
  $margin: 4,
  $padding: 3,
};
