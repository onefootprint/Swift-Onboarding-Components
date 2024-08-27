import { IcoQuote40, icos } from '@onefootprint/icons';
import type { Meta, StoryFn } from '@storybook/react';

import type { EmptyStateProps } from './empty-state';
import EmptyState from './empty-state';

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
} satisfies Meta<typeof EmptyState>;

const Template: StoryFn<EmptyStateProps> = ({
  description,
  iconComponent: Icon = IcoQuote40,
  testID,
  title,
}: EmptyStateProps) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return <EmptyState description={description} iconComponent={SelectedIcon} testID={testID} title={title} />;
};

const HeaderTemplate: StoryFn<EmptyStateProps> = ({
  description,
  renderHeader = () => <h1>Custom Header</h1>,
  testID,
  title,
}: EmptyStateProps) => (
  <EmptyState description={description} renderHeader={renderHeader} testID={testID} title={title} />
);

export const Base = Template.bind({});
Base.args = {
  description: 'Description',
  iconComponent: IcoQuote40,
  title: 'Title',
  testID: 'empty-state-test-id',
};

export const WithCustomHeader = HeaderTemplate.bind({});
WithCustomHeader.args = {
  description: 'Description',
  renderHeader: () => <h1>Custom Header</h1>,
  title: 'Title',
  testID: 'empty-state-test-id',
};
