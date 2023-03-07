import { screen, userEvent, waitFor, within } from '@onefootprint/test-utils';

const clickOnAction = async (options: {
  triggerLabel: string;
  actionText: string;
  confirmationDialogName: string;
}) => {
  const actionButton = screen.getByRole('button', {
    name: options.triggerLabel,
  });
  await userEvent.click(actionButton);
  const removeButton = screen.getByText(options.actionText);
  await userEvent.click(removeButton);
  await waitFor(() => {
    screen.getByRole('dialog', {
      name: options.confirmationDialogName,
    });
  });
  const confirmationDialog = screen.getByRole('dialog', {
    name: options.confirmationDialogName,
  });
  const submitButton = within(confirmationDialog).getByRole('button', {
    name: 'Yes',
  });
  await userEvent.click(submitButton);
  return confirmationDialog;
};

export default clickOnAction;
