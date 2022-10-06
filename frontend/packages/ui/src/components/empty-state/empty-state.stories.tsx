import { IcoQuote40, icos } from '@onefootprint/icons';
import { ComponentMeta, Story } from '@storybook/react';
import React from 'react';

import EmptyState, { EmptyStateProps } from './empty-state';

export default {
  title: 'Components/EmptyState',
  component: EmptyState,
  argTypes: {
    title: {
      control: 'text',
      description: 'Title content',
      name: 'Title',
    },
    description: {
      control: 'text',
      description: 'Title content',
      name: 'Title',
    },
    iconComponent: {
      control: 'select',
      description: 'Icon to be rendered',
      options: Object.keys(icos),
    },
    testID: {
      control: 'text',
      description: 'Append an attribute data-testid for testing purposes',
    },
  },
} as ComponentMeta<typeof EmptyState>;

const Template: Story<EmptyStateProps> = ({
  description,
  iconComponent: Icon,
  renderHeader,
  testID,
  title,
}: EmptyStateProps) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return (
    <EmptyState
      description={description}
      iconComponent={SelectedIcon}
      renderHeader={renderHeader}
      testID={testID}
      title={title}
    />
  );
};

export const Base = Template.bind({});
Base.args = {
  title: 'Title',
  description: 'Description',
  iconComponent: IcoQuote40,
};
