import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import mockRouter from 'next-router-mock';
import CreatePlaybook from './create-playbook';
import { withCreatePlaybook, withOrg } from './create-playbook.test.config';

jest.mock('next/router', () => jest.requireActual('next-router-mock'));

describe('<CreatePlaybook />', () => {
  beforeEach(() => {
    withOrg();
    withCreatePlaybook();
    window.scrollTo = jest.fn();
    mockRouter.setCurrentUrl('playbooks');
  });

  describe('kyc', () => {
    it('should create the playbook', async () => {
      customRender(<CreatePlaybook open onClose={jest.fn()} onDone={jest.fn()} />);

      const templateTitle = await screen.findByRole('heading', {
        name: 'What type of playbook would you like to create?',
      });
      expect(templateTitle).toBeInTheDocument();
      await moveForward();

      const nameTitle = await screen.findByRole('heading', { name: 'Name your playbook' });
      expect(nameTitle).toBeInTheDocument();
      await moveForward();

      const templatesTitle = await screen.findByRole('heading', { name: 'Templates' });
      expect(templatesTitle).toBeInTheDocument();
      await moveForward();

      const residencyTitle = await screen.findByRole('heading', { name: 'Residency' });
      expect(residencyTitle).toBeInTheDocument();
      await moveForward();

      const playbookTitle = await screen.findByRole('heading', { name: 'Your Playbook recommendation' });
      expect(playbookTitle).toBeInTheDocument();
      await moveForward();

      const otpTitle = await screen.findByRole('heading', { name: 'OTP (one-time-passcode) verifications' });
      expect(otpTitle).toBeInTheDocument();
      await moveForward();

      const verificationChecksTitle = await screen.findByRole('heading', { name: 'Verification checks' });
      expect(verificationChecksTitle).toBeInTheDocument();
      await moveForward();

      const confirmation = await screen.findByText('Playbook Created');
      expect(confirmation).toBeInTheDocument();
    });

    describe('edit flow', () => {
      it('should set the dialog title with the name of the playbook', async () => {
        customRender(
          <CreatePlaybook
            open
            onClose={jest.fn()}
            onDone={jest.fn()}
            playbook={getOnboardingConfiguration({
              name: 'ID verification',
              kind: 'kyc',
            })}
          />,
        );

        const dialogTitle = await screen.findByRole('dialog', { name: 'Editing ”ID verification” | KYC playbook' });
        expect(dialogTitle);
      });

      describe('when there are no changes', () => {
        it('should show a message explaining', async () => {
          customRender(
            <CreatePlaybook
              open
              onClose={jest.fn()}
              onDone={jest.fn()}
              playbook={getOnboardingConfiguration({
                name: 'ID verification',
                kind: 'kyc',
                allowInternationalResidents: false,
                internationalCountryRestrictions: [],
                allowUsResidents: true,
                allowUsTerritoryResidents: true,
                cipKind: undefined,
                verificationChecks: [{ kind: 'kyc', data: {} }],
                mustCollectData: [
                  'email',
                  'name',
                  'dob',
                  'full_address',
                  'phone_number',
                  'us_legal_status',
                  'investor_profile',
                  'ssn4',
                ],
              })}
            />,
          );

          // Name
          await screen.findByRole('heading', { name: 'Name your playbook' });
          await moveForward();

          // Residency
          await screen.findByRole('heading', { name: 'Residency' });
          await moveForward();

          // Your Playbook recommendation
          await screen.findByRole('heading', { name: 'Your Playbook recommendation' });
          await moveForward();

          // OTP (one-time-passcode) verifications
          await screen.findByRole('heading', { name: 'OTP (one-time-passcode) verifications' });
          await moveForward();

          // Verification checks
          await screen.findByRole('heading', { name: 'Verification checks' });
          await moveForward();

          await screen.findByRole('heading', { name: 'Review changes' });

          const subtitle = await screen.findByRole('heading', {
            name: 'No changes detected in this playbook. If you need to update any settings, please return to the previous steps and make your adjustments before reviewing.',
          });
          expect(subtitle).toBeInTheDocument();

          const submitButton = await screen.findByRole<HTMLButtonElement>('button', { name: 'Save changes' });
          expect(submitButton).toBeDisabled();
        });
      });
    });
  });
});

const moveForward = async () => {
  const continueButton = screen.getByRole('button', { name: 'Continue' });
  await userEvent.click(continueButton);
};
