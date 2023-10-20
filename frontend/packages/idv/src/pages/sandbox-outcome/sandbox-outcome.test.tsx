import { Layout } from '@onefootprint/idv-elements';
import {
  customRender,
  screen,
  userEvent,
  within,
} from '@onefootprint/test-utils';
import type { PublicOnboardingConfig } from '@onefootprint/types';
import {
  IdDocOutcome,
  OnboardingConfigStatus,
  OverallOutcome,
} from '@onefootprint/types';
import React from 'react';
import { I18nextProvider } from 'react-i18next';

import configureI18next from '../../config/initializers/react-i18next';
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

let submittedFormData: SandboxOutcomeFormData = {
  testID: '',
  outcomes: {
    overallOutcome: OverallOutcome.fail,
    idDocOutcome: IdDocOutcome.fail,
  },
};

const mockHandleFormSubmit = jest
  .fn()
  .mockImplementation((formData: SandboxOutcomeFormData) => {
    submittedFormData = formData;
  });

const SandboxOutcomeWrapper = ({
  requiresIdDoc,
  allowRealDocOutcome,
}: {
  requiresIdDoc: boolean;
  allowRealDocOutcome?: boolean;
}) => (
  <SandboxOutcomeContainer
    config={getOnboardingConfig(requiresIdDoc, allowRealDocOutcome)}
    onSubmit={mockHandleFormSubmit}
  />
);

const renderSandbox = ({
  requiresIdDoc,
  allowRealDocOutcome = true,
}: {
  requiresIdDoc: boolean;
  allowRealDocOutcome?: boolean;
}) => {
  customRender(
    <I18nextProvider i18n={configureI18next()}>
      <Layout onClose={() => {}}>
        <SandboxOutcomeWrapper
          requiresIdDoc={requiresIdDoc}
          allowRealDocOutcome={allowRealDocOutcome}
        />
      </Layout>
    </I18nextProvider>,
  );
};

describe('<SandboxOutcome/>', () => {
  describe('contains all the initial elements', () => {
    it('with id doc case:', () => {
      renderSandbox({ requiresIdDoc: true });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      expect(overallOutcomeOption).toBeInTheDocument();

      const overallSuccessOption =
        within(overallOutcomeOption).getByLabelText('Success');
      const overallManualReviewOption =
        within(overallOutcomeOption).getByLabelText('Manual review');
      const overallFailOption =
        within(overallOutcomeOption).getByLabelText('Fail');
      expect(overallSuccessOption).toBeInTheDocument();
      expect(overallManualReviewOption).toBeInTheDocument();
      expect(overallFailOption).toBeInTheDocument();

      const simulateOutcomeRadioOption =
        screen.getByLabelText('Simulated outcome');
      expect(simulateOutcomeRadioOption).toBeInTheDocument();

      const sandboxSimulatedOutcomes = screen.getByTestId(
        'simulatedOutcomeOptions',
      );
      expect(sandboxSimulatedOutcomes).toBeInTheDocument();

      const simulatedSuccessOption = within(
        sandboxSimulatedOutcomes,
      ).getByLabelText('Success');
      const simulatedFailOption = within(
        sandboxSimulatedOutcomes,
      ).getByLabelText('Fail');
      expect(simulatedSuccessOption).toBeInTheDocument();
      expect(simulatedFailOption).toBeInTheDocument();

      const realOutcomeOption = screen.getByLabelText('Real outcome');
      expect(realOutcomeOption).toBeInTheDocument();

      const testIdTitle = screen.getByText('Test ID');
      expect(testIdTitle).toBeInTheDocument();

      const testIdInfoIcon = screen.getByTestId('infoIcon');
      expect(testIdInfoIcon).toBeInTheDocument();

      const testIdInput = screen.getByRole('textbox');
      expect(testIdInput).toBeInTheDocument();

      const copyButton = screen.getByLabelText('Copy');
      expect(copyButton).toBeInTheDocument();

      const editButton = screen.getByLabelText('Edit');
      expect(editButton).toBeInTheDocument();

      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('without id doc case:', () => {
      renderSandbox({ requiresIdDoc: false });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      expect(overallOutcomeOption).toBeInTheDocument();

      const overallSuccessOption =
        within(overallOutcomeOption).getByLabelText('Success');
      const overallManualReviewOption =
        within(overallOutcomeOption).getByLabelText('Manual review');
      const overallFailOption =
        within(overallOutcomeOption).getByLabelText('Fail');
      expect(overallSuccessOption).toBeInTheDocument();
      expect(overallManualReviewOption).toBeInTheDocument();
      expect(overallFailOption).toBeInTheDocument();

      const simulateOutcomeRadioOption =
        screen.queryAllByLabelText('Simulated outcome');
      expect(simulateOutcomeRadioOption).toHaveLength(0);
      const sandboxSimulatedOutcomes = screen.queryAllByTestId(
        'simulatedOutcomeOptions',
      );
      expect(sandboxSimulatedOutcomes).toHaveLength(0);

      const realOutcomeOption = screen.queryAllByLabelText('Real outcome');
      expect(realOutcomeOption).toHaveLength(0);

      const testIdTitle = screen.getByText('Test ID');
      expect(testIdTitle).toBeInTheDocument();

      const testIdInfoIcon = screen.getByTestId('infoIcon');
      expect(testIdInfoIcon).toBeInTheDocument();

      const testIdInput = screen.getByRole('textbox');
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
      const simulateOutcomeRadioOption =
        screen.queryAllByLabelText('Simulated outcome');
      expect(simulateOutcomeRadioOption).toHaveLength(0);
      const sandboxSimulatedOutcomes = screen.getByTestId(
        'simulatedOutcomeOptions',
      );
      expect(sandboxSimulatedOutcomes).toBeInTheDocument();

      const realOutcomeOption = screen.queryAllByLabelText('Real outcome');
      expect(realOutcomeOption).toHaveLength(0);
    });
  });

  it('the default options are selected correctly in the beginning', () => {
    renderSandbox({ requiresIdDoc: true });

    const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
    const overallSuccessOption =
      within(overallOutcomeOption).getByLabelText('Success');
    const overallManualReviewOption =
      within(overallOutcomeOption).getByLabelText('Manual review');
    const overallFailOption =
      within(overallOutcomeOption).getByLabelText('Fail');

    expect((overallSuccessOption as any).selected).toBeTruthy();
    expect((overallManualReviewOption as any).selected).toBeFalsy();
    expect((overallFailOption as any).selected).toBeFalsy();

    const simulateOutcomeRadioOption =
      screen.getByLabelText('Simulated outcome');
    expect(
      (simulateOutcomeRadioOption as HTMLInputElement).checked,
    ).toBeTruthy();

    const sandboxSimulatedOutcomes = screen.getByTestId(
      'simulatedOutcomeOptions',
    );
    const simulatedSuccessOption = within(
      sandboxSimulatedOutcomes,
    ).getByLabelText('Success');
    const simulatedFailOption = within(sandboxSimulatedOutcomes).getByLabelText(
      'Fail',
    );
    expect((simulatedSuccessOption as any).selected).toBeTruthy();
    expect((simulatedFailOption as any).selected).toBeFalsy();

    const realOutcomeOption = screen.getByLabelText('Real outcome');
    expect((realOutcomeOption as HTMLInputElement).checked).toBeFalsy();
  });

  describe('Outcome selections work properly', () => {
    it('Can change the overall outcome options', async () => {
      renderSandbox({ requiresIdDoc: true });

      const continueButton = screen.getByText('Continue');
      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      const overallSuccessOption =
        within(overallOutcomeOption).getByLabelText('Success');
      const overallManualReviewOption =
        within(overallOutcomeOption).getByLabelText('Manual review');
      const overallFailOption =
        within(overallOutcomeOption).getByLabelText('Fail');
      expect((overallSuccessOption as any).selected).toBeTruthy();
      expect((overallManualReviewOption as any).selected).toBeFalsy();
      expect((overallFailOption as any).selected).toBeFalsy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.overallOutcome).toEqual('pass');

      await userEvent.click(overallManualReviewOption);
      expect((overallSuccessOption as any).selected).toBeFalsy();
      expect((overallManualReviewOption as any).selected).toBeTruthy();
      expect((overallFailOption as any).selected).toBeFalsy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.overallOutcome).toEqual(
        'manual_review',
      );

      await userEvent.click(overallFailOption);
      expect((overallSuccessOption as any).selected).toBeFalsy();
      expect((overallManualReviewOption as any).selected).toBeFalsy();
      expect((overallFailOption as any).selected).toBeTruthy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.overallOutcome).toEqual('fail');
    });

    it('Can change the sandbox outcome options', async () => {
      renderSandbox({ requiresIdDoc: true });

      const continueButton = screen.getByText('Continue');
      const simulateOutcomeRadioOption =
        screen.getByLabelText('Simulated outcome');
      expect(
        (simulateOutcomeRadioOption as HTMLInputElement).checked,
      ).toBeTruthy();

      const sandboxSimulatedOutcomes = screen.getByTestId(
        'simulatedOutcomeOptions',
      );
      const simulatedSuccessOption = within(
        sandboxSimulatedOutcomes,
      ).getByLabelText('Success');
      const simulatedFailOption = within(
        sandboxSimulatedOutcomes,
      ).getByLabelText('Fail');
      const realOutcomeOption = screen.getByLabelText('Real outcome');
      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.idDocOutcome).toEqual('pass');

      await userEvent.click(simulatedFailOption);
      expect((simulatedSuccessOption as any).selected).toBeFalsy();
      expect((simulatedFailOption as any).selected).toBeTruthy();
      expect((realOutcomeOption as HTMLInputElement).checked).toBeFalsy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.idDocOutcome).toEqual('fail');

      await userEvent.click(realOutcomeOption);
      expect((realOutcomeOption as HTMLInputElement).checked).toBeTruthy();
      expect(
        (simulateOutcomeRadioOption as HTMLInputElement).checked,
      ).toBeFalsy();
      expect((simulatedSuccessOption as any).disabled).toBeTruthy();
      expect((simulatedFailOption as any).disabled).toBeTruthy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.idDocOutcome).toEqual('real');

      await userEvent.click(simulateOutcomeRadioOption); // everything goes back to prev state when simulated outcome radio button is clicked again
      expect((simulatedSuccessOption as any).selected).toBeTruthy();
      expect((simulatedFailOption as any).selected).toBeFalsy();
      expect((realOutcomeOption as HTMLInputElement).checked).toBeFalsy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.idDocOutcome).toEqual('pass');
    });

    it('Overall outcome is disabled and set to failed when sandbox outcome is selected to be failed', async () => {
      renderSandbox({ requiresIdDoc: true });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      const overallSuccessOption =
        within(overallOutcomeOption).getByLabelText('Success');
      const overallManualReviewOption =
        within(overallOutcomeOption).getByLabelText('Manual review');
      const overallFailOption =
        within(overallOutcomeOption).getByLabelText('Fail');

      const continueButton = screen.getByText('Continue');
      const sandboxSimulatedOutcomes = screen.getByTestId(
        'simulatedOutcomeOptions',
      );
      const simulatedFailOption = within(
        sandboxSimulatedOutcomes,
      ).getByLabelText('Fail');

      await userEvent.click(simulatedFailOption);
      expect((overallSuccessOption as any).disabled).toBeTruthy();
      expect((overallManualReviewOption as any).disabled).toBeTruthy();
      expect((overallFailOption as any).disabled).toBeTruthy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.overallOutcome).toEqual('fail');
    });

    it('Overall outcome is disabled and set to document_decisions when sandbox outcome is selected to be real', async () => {
      renderSandbox({ requiresIdDoc: true });

      const overallOutcomeOption = screen.getByTestId('overallOutcomeOption');
      const overallSuccessOption =
        within(overallOutcomeOption).getByLabelText('Success');
      const overallManualReviewOption =
        within(overallOutcomeOption).getByLabelText('Manual review');
      const overallFailOption =
        within(overallOutcomeOption).getByLabelText('Fail');

      const continueButton = screen.getByText('Continue');
      const realOutcomeOption = screen.getByLabelText('Real outcome');

      await userEvent.click(realOutcomeOption);
      expect((overallSuccessOption as any).disabled).toBeTruthy();
      expect((overallManualReviewOption as any).disabled).toBeTruthy();
      expect((overallFailOption as any).disabled).toBeTruthy();

      await userEvent.click(continueButton);
      expect(submittedFormData.outcomes.overallOutcome).toEqual(
        'document_decision',
      );
    });
  });

  describe('Test id input and buttons interactions works as expected', () => {
    it('id input already contains a random id', () => {
      renderSandbox({ requiresIdDoc: true });
      const testIdInput = screen.getByRole('textbox') as HTMLInputElement;
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
      const testIdInput = screen.getByRole('textbox') as HTMLInputElement;
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
      const testIdInput = screen.getByRole('textbox') as HTMLInputElement;
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
      const testIdInput = screen.getByRole('textbox') as HTMLInputElement;
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
      const testIdInput = screen.getByRole('textbox') as HTMLInputElement;
      const editButton = screen.getByLabelText('Edit');
      const defaultInputVal = testIdInput.value;
      await userEvent.click(editButton);
      const inputWithSpeciaChar = ':O -> :) -> XD';
      await userEvent.type(testIdInput, ':O -> :) -> XD');
      const saveButton = screen.getByLabelText('Save');
      expect(saveButton.getAttribute('data-disabled')).toBe('true');

      const errorHint = screen.getByText(
        'Test ID is invalid. Please remove spaces and special characters.',
      );
      expect(errorHint).toBeInTheDocument();

      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);
      expect(submittedFormData.testID).not.toEqual(
        `${defaultInputVal}${inputWithSpeciaChar}`,
      );
    });
  });
});
