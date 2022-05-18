import { ComponentMeta, Story } from '@storybook/react';
import Icos from 'icons';
import IcoArrowRightSmall24 from 'icons/ico/ico-arrow-right-small-24';
import IcoPlusSmall24 from 'icons/ico/ico-plus-small-24';
import React from 'react';

import LinkButton, { LinkButtonProps } from './link-button';

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
    size: {
      control: 'select',
      description: 'Size',
      options: ['default', 'compact', 'tiny', 'xTiny', 'xxTiny'],
      table: { defaultValue: { summary: 'default' } },
    },
    target: {
      control: 'select',
      description: 'Where the browser should load the link',
      options: ['_blank', '_self', '_parent', '_top', 'framename'],
    },
    iconPosition: {
      control: 'select',
      description: 'Where the Icon should be placed',
      options: ['left', 'right'],
      table: { defaultValue: { summary: 'right' } },
    },
    Icon: {
      control: 'select',
      description: 'Icon to be rendered',
      options: Object.keys(Icos),
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
    onClick: {
      control: 'object',
      description: 'Callback function triggered upon click',
      required: false,
    },
  },
} as ComponentMeta<typeof LinkButton>;

const Template: Story<LinkButtonProps> = ({
  ariaLabel,
  children,
  href,
  Icon,
  iconPosition,
  onClick,
  size,
  target,
  testID,
}: LinkButtonProps) => {
  const SelectedIcon = typeof Icon === 'string' ? Icos[Icon] : Icon;
  return (
    <LinkButton
      ariaLabel={ariaLabel}
      href={href}
      Icon={SelectedIcon}
      iconPosition={iconPosition}
      onClick={onClick}
      size={size}
      target={target}
      testID={testID}
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
  Icon: IcoArrowRightSmall24,
  iconPosition: 'right',
  size: 'default',
  target: '_blank',
  testID: 'link-button-test-id',
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

export const BaseSize4 = Template.bind({});
BaseSize4.args = {
  children: 'Link button',
  onClick: () => alert('I was pressed'),
  size: 'xxTiny',
};

export const WithIconLeft = Template.bind({});
WithIconLeft.args = {
  children: 'Link button',
  Icon: IcoPlusSmall24,
  iconPosition: 'left',
  onClick: () => alert('I was pressed'),
  size: 'default',
};

export const WithIconRight = Template.bind({});
WithIconRight.args = {
  children: 'Link button',
  Icon: IcoPlusSmall24,
  iconPosition: 'right',
  onClick: () => alert('I was pressed'),
  size: 'default',
};
