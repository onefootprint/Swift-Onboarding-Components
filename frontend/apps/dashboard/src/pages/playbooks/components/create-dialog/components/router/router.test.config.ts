import { mockRequest, screen, userEvent } from '@onefootprint/test-utils';

export const enterName = async (name: string = 'My Playbook') => {
  const nameInput = screen.getByRole('textbox', { name: 'Playbook name' });
  await userEvent.type(nameInput, name);
};

export const moveForward = async () => {
  const button = screen.getByRole('button', { name: 'Next' });
  await userEvent.click(button);
};

export const moveBack = async () => {
  const button = screen.getByRole('button', { name: 'Back' });
  await userEvent.click(button);
};

export const createPlaybook = async () => {
  const button = screen.getByRole('button', { name: 'Create' });
  await userEvent.click(button);
};

export const withCreateOnboardingConfigs = () =>
  mockRequest({
    method: 'post',
    path: '/org/onboarding_configs',
    response: {},
  });
