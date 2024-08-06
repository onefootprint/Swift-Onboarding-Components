import type { Meta, Story } from '@storybook/react';

import type { TagProps } from './tag';
import Tag from './tag';

export default {
  component: Tag,
  title: 'Components/Tag',
  argTypes: {
    children: {
      control: 'text',
      description: 'Content to be rendered',
      required: true,
    },
  },
} as Meta;

const Template: Story<TagProps> = ({ children }: TagProps) => <Tag>{children}</Tag>;

export const Base = Template.bind({});
Base.args = {
  children: 'Tag',
};
