import { screen, userEvent, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import { renderComponents } from '../../../../../../config/tests';
import FormDialog, { FormDialogProps } from './form-dialog';

describe('<FormFormDialog />', () => {
  const renderFormDialog = ({
    title = 'Title',
    onClose = jest.fn(),
    primaryButton = {
      label: 'Primary',
    },
    secondaryButton,
    testID,
    children = 'content',
  }: Partial<FormDialogProps>) =>
    renderComponents(
      <FormDialog
        onClose={onClose}
        primaryButton={primaryButton}
        secondaryButton={secondaryButton}
        testID={testID}
        title={title}
      >
        {children}
      </FormDialog>,
    );

  it('should assign a test id', async () => {
    renderFormDialog({ testID: 'test-id' });
    await waitFor(() => {
      expect(screen.getByTestId('test-id')).toBeInTheDocument();
    });
  });

  it('should show the header text', async () => {
    renderFormDialog({ title: 'header' });
    await waitFor(() => {
      expect(screen.getByText('header')).toBeInTheDocument();
    });
  });

  it('should trigger onClose when clicking on the close button', async () => {
    const onCloseMockFn = jest.fn();
    renderFormDialog({
      onClose: onCloseMockFn,
    });
    const closeButton = screen.getByRole('button', { name: 'Close' });
    await userEvent.click(closeButton);
    expect(onCloseMockFn).toHaveBeenCalled();
  });

  it('should show the content', () => {
    renderFormDialog({ children: 'content' });
    expect(screen.getByText('content')).toBeInTheDocument();
  });

  it('should render the primary button and trigger onClick', async () => {
    const primaryButton = {
      label: 'Primary',
      onClick: jest.fn(),
    };
    renderFormDialog({ primaryButton });
    const button = screen.getByRole('button', { name: 'Primary' });
    await userEvent.click(button);
    expect(primaryButton.onClick).toHaveBeenCalled();
  });

  it('should render the secondary button and trigger onClick', async () => {
    const secondaryButton = {
      label: 'Secondary',
      onClick: jest.fn(),
    };
    renderFormDialog({ secondaryButton });
    const button = screen.getByRole('button', { name: 'Secondary' });
    await userEvent.click(button);
    expect(secondaryButton.onClick).toHaveBeenCalled();
  });
});
