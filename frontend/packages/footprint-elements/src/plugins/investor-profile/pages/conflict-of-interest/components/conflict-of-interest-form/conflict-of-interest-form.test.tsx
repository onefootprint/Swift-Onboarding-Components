import { customRender } from '@onefootprint/test-utils';
import React from 'react';

import ConflictOfInterestForm, {
  ConflictOfInterestFormProps,
} from './conflict-of-interest-form';

describe.skip('<ConflictOfInterestForm />', () => {
  const renderForm = ({
    defaultValues,
    isLoading,
    onSubmit = () => {},
  }: Partial<ConflictOfInterestFormProps>) => {
    customRender(
      <ConflictOfInterestForm
        defaultValues={defaultValues}
        isLoading={isLoading}
        onSubmit={onSubmit}
      />,
    );
  };

  it('onSubmit is called when form is submitted', async () => {
    const onSubmit = jest.fn();
    renderForm({ onSubmit });
    // TODO:
  });

  it('renders default values correctly', async () => {
    renderForm({});
    // TODO:
  });

  it('renders loading state correctly', async () => {
    renderForm({ isLoading: true });
    // TODO:
  });

  it('renders error state correctly', async () => {
    renderForm({});
    // TODO:
  });
});
