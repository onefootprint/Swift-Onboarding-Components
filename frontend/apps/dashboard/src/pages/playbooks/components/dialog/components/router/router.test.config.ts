import { screen, userEvent } from '@onefootprint/test-utils';

export const enterName = async () => {
  const nameInput = screen.getByRole('textbox', { name: 'Playbook name' });
  await userEvent.type(nameInput, 'My Playbook');
  const next = screen.getByRole('button', { name: 'Next' });
  await userEvent.click(next);
};

export const selectWhoToOnboard = async () => {
  const KYC = screen.getByText('Onboard people');
  await userEvent.click(KYC);
  const continueButton = screen.getByRole('button', { name: 'Continue' });
  await userEvent.click(continueButton);
};

export const confirmPlaybookRecommendation = async () => {
  expect(screen.getByText('Your Playbook recommendation')).toBeInTheDocument();
  const next = screen.getByRole('button', { name: 'Next' });
  await userEvent.click(next);
  // stepper value and header
  expect(screen.getAllByText('Authorized scopes').length).toEqual(2);
};
