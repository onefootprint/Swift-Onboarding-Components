import '../../config/initializers/i18next-test';

import { customRender, screen, userEvent, within } from '@onefootprint/test-utils';
import { IdVerificationOutcome, type PublicOnboardingConfig } from '@onefootprint/types';
import { IdDocOutcome, OnboardingConfigStatus, OverallOutcome } from '@onefootprint/types';

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

let submittedFormData: SandboxOutcomeFormData | undefined;

const mockHandleFormSubmit = jest.fn().mockImplementation((formData: SandboxOutcomeFormData) => {
  submittedFormData = formData;
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
    onSubmit={mockHandleFormSubmit}
    config={getOnboardingConfig(requiresIdDoc, allowRealDocOutcome)}
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
  beforeEach(() => {
    submittedFormData = undefined;
  });
  describe('contains all the initial elements', () => {
    it('with id doc case:', async () => {
      renderSandbox({ requiresIdDoc: true });

      const overallOutcomeOption = screen.getByLabelText('General outcome');
      within(overallOutcomeOption).getByRole('option', {
        name: 'Success',
        selected: true,
      });
      within(overallOutcomeOption).getByRole('option', {
        name: 'Fail',
        selected: false,
      });
      within(overallOutcomeOption).getByRole('option', {
        name: 'Manual review',
        selected: false,
      });

      const docVerificationOption = screen.getByLabelText('Document verification');
      within(docVerificationOption).getByRole('option', {
        name: 'Simulated outcome',
        selected: true,
      });
      within(docVerificationOption).getByRole('option', {
        name: 'Real outcome',
        selected: false,
      });

      const simulatedOutcomeOption = screen.getByLabelText('Choose simulated outcome');
      within(simulatedOutcomeOption).getByRole('option', {
        name: 'Success',
        selected: true,
      });
      within(simulatedOutcomeOption).getByRole('option', {
        name: 'Fail',
        selected: false,
      });

      expect(screen.getByTestId('test-id-input')).toBeInTheDocument();
      expect(screen.getByTestId('infoIcon')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('without id doc case:', async () => {
      renderSandbox({ requiresIdDoc: false });

      const overallOutcomeOption = screen.getByLabelText('General outcome');
      within(overallOutcomeOption).getByRole('option', {
        name: 'Success',
        selected: true,
      });
      within(overallOutcomeOption).getByRole('option', {
        name: 'Fail',
        selected: false,
      });
      within(overallOutcomeOption).getByRole('option', {
        name: 'Manual review',
        selected: false,
      });

      const docVerificationOption = screen.queryByLabelText('Document verification');
      expect(docVerificationOption).not.toBeInTheDocument();

      const simulatedOutcomeOption = screen.queryByLabelText('Choose simulated outcome');
      expect(simulatedOutcomeOption).not.toBeInTheDocument();

      expect(screen.getByTestId('test-id-input')).toBeInTheDocument();
      expect(screen.getByTestId('infoIcon')).toBeInTheDocument();
      expect(screen.getByLabelText('Copy')).toBeInTheDocument();
      expect(screen.getByLabelText('Edit')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Continue' })).toBeInTheDocument();
    });

    it('without id doc real outcome case:', () => {
      renderSandbox({ requiresIdDoc: true, allowRealDocOutcome: false });

      const docVerificationOption = screen.queryByLabelText('Document verification');
      expect(docVerificationOption).not.toBeInTheDocument();

      expect(screen.getByText('Simulated outcome')).toBeInTheDocument();
      expect(screen.queryByText('Real outcome')).not.toBeInTheDocument();
    });

    it("doesn't show test id input when collectTestId is false", () => {
      renderSandbox({ collectTestId: false, requiresIdDoc: true });
      const testIdInput = screen.queryByTestId('test-id-input');
      expect(testIdInput).not.toBeInTheDocument();
    });
  });

  describe('Outcome selections work properly', () => {
    it('Overall outcome is disabled and set to failed when doc outcome is selected to be failed', async () => {
      renderSandbox({ requiresIdDoc: true });

      const simulatedOutcomeOption = screen.getByLabelText('Choose simulated outcome');
      await userEvent.selectOptions(simulatedOutcomeOption, 'Fail');
      expect(screen.getByText('General outcome will fail if document verification fails')).toBeInTheDocument();

      const overallOutcomeOption = screen.getByLabelText('General outcome');
      expect(overallOutcomeOption).toBeDisabled();
      expect(overallOutcomeOption).toHaveTextContent('Fail');

      await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(submittedFormData?.overallOutcome).toEqual(OverallOutcome.fail);
      expect(submittedFormData?.idDocOutcome).toEqual(IdDocOutcome.fail);
    });

    it('Overall outcome is disabled and set to use_rules_outcome when sandbox outcome is selected to be real', async () => {
      renderSandbox({ requiresIdDoc: true });

      const docVerificationOption = screen.getByLabelText('Document verification');
      await userEvent.selectOptions(docVerificationOption, 'Real outcome');

      const overallOutcomeOption = screen.getByLabelText('General outcome');
      expect(overallOutcomeOption).toBeDisabled();
      expect(overallOutcomeOption).toHaveTextContent('-');

      await userEvent.click(screen.getByRole('button', { name: 'Continue' }));

      expect(submittedFormData?.overallOutcome).toEqual(OverallOutcome.useRulesOutcome);
      expect(submittedFormData?.docVerificationOutcome).toEqual(IdVerificationOutcome.real);
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
      expect(saveButton).toBeDisabled();

      const errorHint = screen.getByText('Test ID is invalid. Please remove spaces and special characters.');
      expect(errorHint).toBeInTheDocument();

      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);
      expect(submittedFormData?.testID).not.toEqual(`${defaultInputVal}${inputWithSpeciaChar}`);
    });
  });
});
