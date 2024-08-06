import { IcoQuote40, icos } from '@onefootprint/icons';
import type { ComponentMeta, Story } from '@storybook/react';

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
} as ComponentMeta<typeof EmptyState>;

const Template: Story<EmptyStateProps> = ({
  description,
  iconComponent: Icon = IcoQuote40,
  testID,
  title,
}: EmptyStateProps) => {
  const SelectedIcon = typeof Icon === 'string' ? icos[Icon] : Icon;
  return <EmptyState description={description} iconComponent={SelectedIcon} testID={testID} title={title} />;
};

const HeaderTemplate: Story<EmptyStateProps> = ({
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
