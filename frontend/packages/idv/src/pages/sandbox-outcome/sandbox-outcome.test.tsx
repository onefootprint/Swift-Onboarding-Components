import '../../config/initializers/i18next-test';

import { customRender, fireEvent, screen, selectEvents, userEvent, waitFor, within } from '@onefootprint/test-utils';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcome, OnboardingConfigStatus, OverallOutcome } from '@onefootprint/types';
import React from 'react';

import { Layout } from '../../components';
import SandboxOutcomeContainer from './components/sandbox-outcome-container';
import type { SandboxOutcomeFormData } from './types';

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
  isInstantAppEnabled: false,
  appClipExperienceId: 'app_exp_9KlTyouGLSNKMgJmpUdBAF',
  isNoPhoneFlow: false,
  requiresIdDoc,
  key: 'key',
  isKyb: false,
  allowInternationalResidents: false,
  canMakeRealDocScanCallsInSandbox,
});

let submittedFormData: {
  testID?: string;
  overallOutcome: OverallOutcome;
  idDocOutcome: IdDocOutcome;
} = {
  testID: undefined,
  overallOutcome: OverallOutcome.fail,
  idDocOutcome: IdDocOutcome.fail,
};

const mockHandleFormSubmit = jest.fn().mockImplementation((formData: SandboxOutcomeFormData) => {
  submittedFormData = {
    testID: formData.testID,
    overallOutcome: formData.outcomes.overallOutcome.value,
    idDocOutcome: formData.outcomes.idDocOutcome.value,
  };
});

const SandboxOutcomeWrapper = ({
  requiresIdDoc,
  allowRealDocOutcome,
  collectTestId,
}: {
  requiresIdDoc: boolean;
  allowRealDocOutcome?: boolean;
  collectTestId?: boolean;
}) => (
  <SandboxOutcomeContainer
    config={getOnboardingConfig(requiresIdDoc, allowRealDocOutcome)}
    onSubmit={mockHandleFormSubmit}
    collectTestId={collectTestId}
  />
);

const renderSandbox = ({
  requiresIdDoc,
  allowRealDocOutcome = true,
  collectTestId = true,
}: {
  requiresIdDoc: boolean;
  allowRealDocOutcome?: boolean;
  collectTestId?: boolean;
}) => {
  customRender(
    <Layout onClose={() => undefined}>
      <SandboxOutcomeWrapper
        requiresIdDoc={requiresIdDoc}
        allowRealDocOutcome={allowRealDocOutcome}
        collectTestId={collectTestId}
      />
    </Layout>,
  );
};

describe('<SandboxOutcome/>', () => {
  describe('contains all the initial elements', () => {
    it('with id doc case:', async () => {
      renderSandbox({ requiresIdDoc: true });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      expect(overallOutcomeOption).toBeInTheDocument();

      const overallSuccessOption = within(overallOutcomeOption).getByText('Success');
      expect(overallSuccessOption).toBeInTheDocument();
      let trigger = within(overallOutcomeOption).getByRole('button', {
        name: 'Success',
      });
      await selectEvents.openMenu(trigger);
      const overallFailOption = within(overallOutcomeOption).getByText('Fail');
      const overallManualReviewOption = within(overallOutcomeOption).getByText('Manual review');
      expect(overallFailOption).toBeInTheDocument();
      expect(overallManualReviewOption).toBeInTheDocument();

      const simulateOutcomeRadioOption = screen.getByLabelText('Simulated outcome');
      expect(simulateOutcomeRadioOption).toBeInTheDocument();

      const sandboxSimulatedOutcomes = screen.getByTestId('simulatedOutcomeOptions');
      expect(sandboxSimulatedOutcomes).toBeInTheDocument();

      const simulatedSuccessOption = within(sandboxSimulatedOutcomes).getByText('Success');
      expect(simulatedSuccessOption).toBeInTheDocument();
      trigger = within(sandboxSimulatedOutcomes).getByRole('button', {
        name: 'Success',
      });
      await selectEvents.openMenu(trigger);
      const idDocFailOption = within(sandboxSimulatedOutcomes).getByText('Fail');
      expect(idDocFailOption).toBeInTheDocument();

      const realOutcomeOption = screen.getByLabelText('Real outcome');
      expect(realOutcomeOption).toBeInTheDocument();

      const testIdTitle = screen.getByText('Test ID');
      expect(testIdTitle).toBeInTheDocument();

      const testIdInfoIcon = screen.getByTestId('infoIcon');
      expect(testIdInfoIcon).toBeInTheDocument();

      const testIdInput = screen.getByTestId('test-id-input');
      expect(testIdInput).toBeInTheDocument();

      const copyButton = screen.getByLabelText('Copy');
      expect(copyButton).toBeInTheDocument();

      const editButton = screen.getByLabelText('Edit');
      expect(editButton).toBeInTheDocument();

      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('without id doc case:', async () => {
      renderSandbox({ requiresIdDoc: false });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      expect(overallOutcomeOption).toBeInTheDocument();

      const overallSuccessOption = within(overallOutcomeOption).getByText('Success');
      expect(overallSuccessOption).toBeInTheDocument();
      const trigger = within(overallOutcomeOption).getByRole('button', {
        name: 'Success',
      });
      await selectEvents.openMenu(trigger);
      const overallFailOption = within(overallOutcomeOption).getByText('Fail');
      const overallManualReviewOption = within(overallOutcomeOption).getByText('Manual review');
      expect(overallFailOption).toBeInTheDocument();
      expect(overallManualReviewOption).toBeInTheDocument();

      const simulateOutcomeRadioOption = screen.queryAllByLabelText('Simulated outcome');
      expect(simulateOutcomeRadioOption).toHaveLength(0);
      const sandboxSimulatedOutcomes = screen.queryAllByTestId('simulatedOutcomeOptions');
      expect(sandboxSimulatedOutcomes).toHaveLength(0);

      const realOutcomeOption = screen.queryAllByLabelText('Real outcome');
      expect(realOutcomeOption).toHaveLength(0);

      const testIdTitle = screen.getByText('Test ID');
      expect(testIdTitle).toBeInTheDocument();

      const testIdInfoIcon = screen.getByTestId('infoIcon');
      expect(testIdInfoIcon).toBeInTheDocument();

      const testIdInput = screen.getByTestId('test-id-input');
      expect(testIdInput).toBeInTheDocument();

      const copyButton = screen.getByLabelText('Copy');
      expect(copyButton).toBeInTheDocument();

      const editButton = screen.getByLabelText('Edit');
      expect(editButton).toBeInTheDocument();

      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('without id doc real outcome case:', () => {
      renderSandbox({ requiresIdDoc: true, allowRealDocOutcome: false });
      const simulateOutcomeRadioOption = screen.queryAllByLabelText('Simulated outcome');
      expect(simulateOutcomeRadioOption).toHaveLength(0);
      const sandboxSimulatedOutcomes = screen.getByTestId('simulatedOutcomeOptions');
      expect(sandboxSimulatedOutcomes).toBeInTheDocument();

      const realOutcomeOption = screen.queryAllByLabelText('Real outcome');
      expect(realOutcomeOption).toHaveLength(0);
    });

    it("doesn't show test id input when collectTestId is false", () => {
      renderSandbox({ collectTestId: false, requiresIdDoc: true });
      const testIdInput = screen.queryAllByTestId('test-id-input');
      expect(testIdInput).toHaveLength(0);
    });
  });

  it('the default options are selected correctly in the beginning', () => {
    renderSandbox({ requiresIdDoc: true });

    const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
    const overallSuccessOption = within(overallOutcomeOption).getByText('Success');
    const overallManualReviewOption = within(overallOutcomeOption).queryAllByText('Manual review');
    const overallFailOption = within(overallOutcomeOption).queryAllByText('Fail');

    expect(overallSuccessOption).toBeInTheDocument();
    expect(overallManualReviewOption).toHaveLength(0);
    expect(overallFailOption).toHaveLength(0);

    const simulateOutcomeRadioOption = screen.getByLabelText('Simulated outcome');
    expect((simulateOutcomeRadioOption as HTMLInputElement).checked).toBeTruthy();

    const sandboxSimulatedOutcomes = screen.getByTestId('simulatedOutcomeOptions');
    const simulatedSuccessOption = within(sandboxSimulatedOutcomes).getByText('Success');
    const simulatedFailOption = within(sandboxSimulatedOutcomes).queryAllByText('Fail');
    expect(simulatedSuccessOption).toBeInTheDocument();
    expect(simulatedFailOption).toHaveLength(0);

    const realOutcomeOption = screen.getByLabelText('Real outcome');
    expect((realOutcomeOption as HTMLInputElement).checked).toBeFalsy();
  });

  describe('Outcome selections work properly', () => {
    it('Can change the overall outcome options', async () => {
      renderSandbox({ requiresIdDoc: true });

      const continueButton = screen.getByText('Continue');
      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      const overallSuccessOption = within(overallOutcomeOption).getByText('Success');
      let overallManualReviewOptions = within(overallOutcomeOption).queryAllByText('Manual review');
      const overallFailOptions = within(overallOutcomeOption).queryAllByText('Fail');

      expect(overallSuccessOption).toBeInTheDocument();
      expect(overallManualReviewOptions).toHaveLength(0);
      expect(overallFailOptions).toHaveLength(0);

      await userEvent.click(continueButton);
      expect(submittedFormData.overallOutcome).toEqual('pass');

      let trigger = within(overallOutcomeOption).getByRole('button', {
        name: 'Success',
      });
      await selectEvents.openMenu(trigger);
      const overallManualReviewOption = within(overallOutcomeOption).getByText('Manual review');
      fireEvent.click(overallManualReviewOption);
      await waitFor(() => {
        const overallSuccessOptions = within(overallOutcomeOption).queryAllByText('Success');
        expect(overallSuccessOptions).toHaveLength(0);
      });
      await userEvent.click(continueButton);
      expect(submittedFormData.overallOutcome).toEqual('manual_review');

      trigger = within(overallOutcomeOption).getByRole('button', {
        name: 'Manual review',
      });
      await selectEvents.openMenu(trigger);
      const overallFailOption = within(overallOutcomeOption).getByText('Fail');
      fireEvent.click(overallFailOption);
      await waitFor(() => {
        overallManualReviewOptions = within(overallOutcomeOption).queryAllByText('Manual review');
        expect(overallManualReviewOptions).toHaveLength(0);
      });
      await userEvent.click(continueButton);
      expect(submittedFormData.overallOutcome).toEqual('fail');
    });

    it('Can change the sandbox outcome options', async () => {
      renderSandbox({ requiresIdDoc: true });

      const continueButton = screen.getByText('Continue');
      const simulateOutcomeRadioOption = screen.getByLabelText('Simulated outcome');
      expect((simulateOutcomeRadioOption as HTMLInputElement).checked).toBeTruthy();
      await userEvent.click(continueButton);
      expect(submittedFormData.idDocOutcome).toEqual('pass');

      let sandboxSimulatedOutcomes = screen.getByTestId('simulatedOutcomeOptions');
      const trigger = within(sandboxSimulatedOutcomes).getByRole('button', {
        name: 'Success',
      });
      await selectEvents.openMenu(trigger);
      const idDocFailOption = within(sandboxSimulatedOutcomes).getByText('Fail');
      fireEvent.click(idDocFailOption);
      await waitFor(() => {
        const idDocSuccessOptions = within(sandboxSimulatedOutcomes).queryAllByText('Success');
        expect(idDocSuccessOptions).toHaveLength(0);
      });
      await userEvent.click(continueButton);
      expect(submittedFormData.idDocOutcome).toEqual('fail');

      const realOutcomeOption = screen.getByLabelText('Real outcome');
      await userEvent.click(realOutcomeOption);
      expect((realOutcomeOption as HTMLInputElement).checked).toBeTruthy();
      expect((simulateOutcomeRadioOption as HTMLInputElement).checked).toBeFalsy();
      await userEvent.click(continueButton);
      expect(submittedFormData.idDocOutcome).toEqual('real');

      await userEvent.click(simulateOutcomeRadioOption); // everything goes back to prev state when simulated outcome radio button is clicked again
      expect((realOutcomeOption as HTMLInputElement).checked).toBeFalsy();
      sandboxSimulatedOutcomes = screen.getByTestId('simulatedOutcomeOptions');
      await waitFor(() => {
        const idDocSuccessOption = within(sandboxSimulatedOutcomes).getByText('Success');
        expect(idDocSuccessOption).toBeInTheDocument();
      });
      await userEvent.click(continueButton);
      await userEvent.click(continueButton);
      expect(submittedFormData.idDocOutcome).toEqual('pass');
    });

    it('Overall outcome is disabled and set to failed when sandbox outcome is selected to be failed', async () => {
      renderSandbox({ requiresIdDoc: true });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      const continueButton = screen.getByText('Continue');
      const sandboxSimulatedOutcomes = screen.getByTestId('simulatedOutcomeOptions');
      const trigger = within(sandboxSimulatedOutcomes).getByRole('button', {
        name: 'Success',
      });
      await selectEvents.openMenu(trigger);
      const idDocFailOption = within(sandboxSimulatedOutcomes).getByText('Fail');
      fireEvent.click(idDocFailOption);
      await waitFor(() => {
        const idDocSuccessOptions = within(sandboxSimulatedOutcomes).queryAllByText('Success');
        expect(idDocSuccessOptions).toHaveLength(0);
      });

      expect(
        (
          within(overallOutcomeOption).getByRole('button', {
            name: 'Fail',
          }) as HTMLButtonElement
        ).disabled,
      ).toBeTruthy();

      await userEvent.click(continueButton);
      expect(submittedFormData.overallOutcome).toEqual('fail');
    });

    it('Overall outcome is disabled and set to document_decisions when sandbox outcome is selected to be real', async () => {
      renderSandbox({ requiresIdDoc: true });
      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      const continueButton = screen.getByText('Continue');
      const realOutcomeOption = screen.getByLabelText('Real outcome');
      await userEvent.click(realOutcomeOption);
      expect(
        (
          within(overallOutcomeOption).getByRole('button', {
            name: '-',
          }) as HTMLButtonElement
        ).disabled,
      ).toBeTruthy();
      await userEvent.click(continueButton);
      expect(submittedFormData.overallOutcome).toEqual('document_decision');
    });
  });

  describe('Test id input and buttons interactions works as expected', () => {
    it('id input already contains a random id', () => {
      renderSandbox({ requiresIdDoc: true });
      const testIdInput = screen.getByTestId('test-id-input') as HTMLInputElement;
      expect(testIdInput.value).not.toEqual('');
    });

    it('hint, reset button and save button show up after edit button is clicked', async () => {
      renderSandbox({ requiresIdDoc: true });
      const editButton = screen.getByLabelText('Edit');
      await userEvent.click(editButton);
      const hint = screen.getByText('Do not use special characters or spaces.');
      expect(hint).toBeInTheDocument();

      const saveButton = screen.getByLabelText('Save');
      const resetButton = screen.getByLabelText('Reset');
      expect(saveButton).toBeInTheDocument();
      expect(resetButton).toBeInTheDocument();
    });

    it('can edit only after the edit button is clicked', async () => {
      renderSandbox({ requiresIdDoc: true });
      const testIdInput = screen.getByTestId('test-id-input') as HTMLInputElement;
      const editButton = screen.getByLabelText('Edit');
      expect(testIdInput.disabled).toBeTruthy();

      await userEvent.click(editButton);
      expect(testIdInput.disabled).toBeFalsy();

      const defaultInputVal = testIdInput.value;
      await userEvent.type(testIdInput, 'slow day :(');
      expect(testIdInput.value).toEqual(`${defaultInputVal}slow day :(`);
    });

    it('can save/lock new id input', async () => {
      renderSandbox({ requiresIdDoc: true });
      const testIdInput = screen.getByTestId('test-id-input') as HTMLInputElement;
      const editButton = screen.getByLabelText('Edit');
      await userEvent.click(editButton);
      const defaultInputVal = testIdInput.value;
      await userEvent.type(testIdInput, 'input');
      expect(testIdInput.value).toEqual(`${defaultInputVal}input`);

      const saveButton = screen.getByLabelText('Save');
      await userEvent.click(saveButton);
      expect(testIdInput.disabled).toBeTruthy(); // locked
    });

    it('can reset to old input', async () => {
      renderSandbox({ requiresIdDoc: true });
      const testIdInput = screen.getByTestId('test-id-input') as HTMLInputElement;
      const editButton = screen.getByLabelText('Edit');
      await userEvent.click(editButton);
      const defaultInputVal = testIdInput.value;
      await userEvent.type(testIdInput, 'input');
      const resetButton = screen.getByLabelText('Reset');
      await userEvent.click(resetButton);
      expect(testIdInput.value).toEqual(`${defaultInputVal}`);
    });

    it('special characters shows error hint, disables continue, and save buttons', async () => {
      renderSandbox({ requiresIdDoc: true });
      const testIdInput = screen.getByTestId('test-id-input') as HTMLInputElement;
      const editButton = screen.getByLabelText('Edit');
      const defaultInputVal = testIdInput.value;
      await userEvent.click(editButton);
      const inputWithSpeciaChar = ':O -> :) -> XD';
      await userEvent.type(testIdInput, ':O -> :) -> XD');
      const saveButton = screen.getByLabelText('Save');
      expect(saveButton.getAttribute('data-disabled')).toBe('true');

      const errorHint = screen.getByText('Test ID is invalid. Please remove spaces and special characters.');
      expect(errorHint).toBeInTheDocument();

      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);
      expect(submittedFormData.testID).not.toEqual(`${defaultInputVal}${inputWithSpeciaChar}`);
    });
  });
});
