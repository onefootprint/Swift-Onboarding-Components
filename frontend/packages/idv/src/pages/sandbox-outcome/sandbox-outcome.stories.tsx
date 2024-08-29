import { OnboardingConfigStatus, type PublicOnboardingConfig } from '@onefootprint/types';
import type { Meta, StoryFn, StoryObj } from '@storybook/react';
import { expect, fn, userEvent } from '@storybook/test';
import noop from 'lodash/noop';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';
import type { SandboxOutcomeFormData } from './types';

const Template: StoryFn<{
  requiresIdDoc: boolean;
  allowRealDocOutcome?: boolean;
  collectTestId?: boolean;
  onSubmit: (formData: SandboxOutcomeFormData) => void;
}> = ({ requiresIdDoc, allowRealDocOutcome, collectTestId, onSubmit }) => {
  return (
    <SandboxOutcomeContainer
      onSubmit={onSubmit}
      config={getOnboardingConfig(requiresIdDoc, allowRealDocOutcome)}
      collectTestId={collectTestId}
    />
  );
};

export default {
  component: SandboxOutcomeContainer,
  title: 'SandboxOutcome',
  args: {
    // 👇 Use `fn` to spy on the onSubmit arg
    onSubmit: fn(),
  },
} satisfies Meta<typeof SandboxOutcomeContainer>;

const getOnboardingConfig = (
  requiresIdDoc = true,
  canMakeRealDocScanCallsInSandbox = true,
): PublicOnboardingConfig => ({
  isLive: false,
  logoUrl: 'url',
  privacyPolicyUrl: 'url',
  name: 'tenant',
  orgName: 'tenantOrg',
  orgId: 'orgId',
  status: OnboardingConfigStatus.enabled,
  isAppClipEnabled: false,
  isStepupEnabled: true,
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow: false,
  requiresIdDoc,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: false,
  canMakeRealDocScanCallsInSandbox,
});
type Story = StoryObj<typeof SandboxOutcomeContainer>;

export const GeneralOutcomeOnly: StoryFn = () => (
  <Template requiresIdDoc={false} collectTestId={false} onSubmit={noop} />
);

export const WithTestId: StoryFn = () => <Template requiresIdDoc={false} collectTestId onSubmit={noop} />;

export const WithIdDocAndTestId: StoryFn = () => <Template requiresIdDoc={true} collectTestId onSubmit={noop} />;

export const SubmissionWithSuccessAndSimulated: Story = {
  play: async ({ mount, args, step }) => {
    const screen = await mount(<Template requiresIdDoc={true} collectTestId onSubmit={args.onSubmit} />);
    const testIdInput = screen.getByLabelText<HTMLInputElement>('Test ID');

    await step('Submit form', async () => {
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      const mockedOnSubmit = args.onSubmit as jest.Mock;
      await expect(mockedOnSubmit.mock.calls[0][0]).toEqual({
        docVerificationOutcome: 'simulated',
        idDocOutcome: 'pass',
        overallOutcome: 'pass',
        testID: testIdInput.value,
      });
    });
  },
};

export const SubmissionWithSuccessAndReal: Story = {
  play: async ({ mount, args, step }) => {
    const screen = await mount(<Template requiresIdDoc={true} collectTestId onSubmit={args.onSubmit} />);
    const testIdInput = screen.getByLabelText<HTMLInputElement>('Test ID');

    await step('Change doc verification to real', async () => {
      const documentSelect = screen.getByRole('combobox', { name: 'Document verification' });
      await userEvent.selectOptions(documentSelect, 'real');

      const hint = await screen.findByText(
        "We'll run uploaded images through the same processor used in production and outcomes will reflect the real response.",
      );
      expect(hint).toBeInTheDocument();

      const generalOutcomeSelect = screen.getByRole('combobox', { name: 'General outcome' });
      expect(generalOutcomeSelect).toBeDisabled();
    });

    await step('Submit form', async () => {
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      const mockedOnSubmit = args.onSubmit as jest.Mock;
      await expect(mockedOnSubmit.mock.calls[0][0]).toEqual({
        docVerificationOutcome: 'real',
        idDocOutcome: 'pass',
        overallOutcome: 'use_rules_outcome',
        testID: testIdInput.value,
      });
    });
  },
};

export const SubmissionWithSimulatedAndFail: Story = {
  play: async ({ mount, args, step }) => {
    const screen = await mount(<Template requiresIdDoc={true} collectTestId onSubmit={args.onSubmit} />);
    const testIdInput = screen.getByLabelText<HTMLInputElement>('Test ID');

    await step('Change simulated outcome to fail', async () => {
      const simulatedOutcomeSelect = screen.getByRole('combobox', { name: 'Choose simulated outcome' });
      await userEvent.selectOptions(simulatedOutcomeSelect, 'fail');

      const warning = await screen.findByText('General outcome will fail if document verification fails');
      expect(warning).toBeInTheDocument();

      const generalOutcomeSelect = screen.getByRole('combobox', { name: 'General outcome' });
      expect(generalOutcomeSelect).toBeDisabled();
      expect(generalOutcomeSelect).toHaveTextContent('Fail');
    });

    await step('Submit form', async () => {
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      const mockedOnSubmit = args.onSubmit as jest.Mock;
      await expect(mockedOnSubmit.mock.calls[0][0]).toEqual({
        docVerificationOutcome: 'simulated',
        idDocOutcome: 'fail',
        overallOutcome: 'fail',
        testID: testIdInput.value,
      });
    });
  },
};

export const SubmissionWithStepUp: Story = {
  play: async ({ mount, args, step }) => {
    const screen = await mount(<Template requiresIdDoc={true} collectTestId onSubmit={args.onSubmit} />);
    const testId = screen.getByLabelText<HTMLInputElement>('Test ID');

    await step('Change general outcome to step up', async () => {
      const generalOutcomeSelect = screen.getByRole('combobox', { name: 'General outcome' });
      await userEvent.selectOptions(generalOutcomeSelect, 'step_up');

      const hint = await screen.findByText('Even if not required in playbook, users will upload ID photos.');
      expect(hint).toBeInTheDocument();
    });

    await step('Submit form', async () => {
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      const mockedOnSubmit = args.onSubmit as jest.Mock;
      await expect(mockedOnSubmit.mock.calls[0][0]).toEqual({
        docVerificationOutcome: 'simulated',
        idDocOutcome: 'pass',
        overallOutcome: 'step_up',
        testID: testId.value,
      });
    });
  },
};

export const TestIdFieldValidations: Story = {
  play: async ({ mount, args, step }) => {
    const screen = await mount(<Template requiresIdDoc={true} collectTestId onSubmit={args.onSubmit} />);
    const testIdInput = screen.getByLabelText<HTMLInputElement>('Test ID');

    const initialTestId = testIdInput.value;
    const newTestId = 'newTestId';

    await step('Enter invalid test id', async () => {
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await userEvent.click(editButton);

      const hint = screen.getByText('Do not use special characters or spaces.');
      expect(hint).toBeInTheDocument();

      await userEvent.type(testIdInput, '$!@$');

      const invalidError = await screen.findByText('Test ID is invalid. Please remove spaces and special characters.');
      expect(invalidError).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeDisabled();

      await userEvent.clear(testIdInput);
      const requiredError = await screen.findByText('Test ID is required');
      expect(requiredError).toBeInTheDocument();

      expect(saveButton).toBeDisabled();
    });

    await step('Enter empty test id', async () => {
      await userEvent.clear(testIdInput);
      const requiredError = await screen.findByText('Test ID is required');
      expect(requiredError).toBeInTheDocument();

      const saveButton = screen.getByRole('button', { name: 'Save' });
      expect(saveButton).toBeDisabled();
    });

    await step('Reset test id', async () => {
      await userEvent.type(testIdInput, newTestId);
      const resetButton = screen.getByRole('button', { name: 'Reset' });
      await userEvent.click(resetButton);
      expect(testIdInput.value).toEqual(initialTestId);
    });

    await step('Change and save test id', async () => {
      const editButton = screen.getByRole('button', { name: 'Edit' });
      await userEvent.click(editButton);

      await userEvent.clear(testIdInput);
      await userEvent.type(testIdInput, newTestId);

      const saveButton = screen.getByRole('button', { name: 'Save' });
      await userEvent.click(saveButton);

      expect(testIdInput).not.toEqual(initialTestId);
    });

    await step('Submit form', async () => {
      const submitButton = screen.getByRole('button', { name: 'Continue' });
      await userEvent.click(submitButton);

      const mockedOnSubmit = args.onSubmit as jest.Mock;
      await expect(mockedOnSubmit.mock.calls[0][0]).toEqual(
        expect.objectContaining({
          testID: newTestId,
        }),
      );
    });
  },
};
