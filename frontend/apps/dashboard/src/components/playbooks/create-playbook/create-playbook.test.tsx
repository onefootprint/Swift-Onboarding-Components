import { getOnboardingConfiguration } from '@onefootprint/fixtures/dashboard';
import { customRender, screen, userEvent, within } from '@onefootprint/test-utils';
import CreatePlaybook from './create-playbook';
import { withCreatePlaybook, withOrg } from './create-playbook.test.config';

describe('<CreatePlaybook />', () => {
  beforeEach(() => {
    withOrg();
    withCreatePlaybook();
    window.scrollTo = jest.fn();
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

      it('should edit the playbook', async () => {
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

        // Name step
        const nameTitle = await screen.findByRole('heading', { name: 'Name your playbook' });
        expect(nameTitle).toBeInTheDocument();

        const nameInput = await screen.getByLabelText<HTMLInputElement>('Playbook name');
        expect(nameInput.value).toEqual('ID verification');

        await moveForward();

        // Residency step
        const residencyTitle = await screen.findByRole('heading', { name: 'Residency' });
        expect(residencyTitle).toBeInTheDocument();

        const usRadio = await screen.findByLabelText<HTMLInputElement>('United States');
        expect(usRadio.value).toEqual('us');

        const usTerritories = await screen.findByLabelText<HTMLInputElement>(
          'Allow residents from U.S. territories to be onboarded',
        );
        expect(usTerritories).toBeChecked();

        await moveForward();

        // Playbook recommendation
        const playbookTitle = await screen.findByRole('heading', { name: 'Your Playbook recommendation' });
        expect(playbookTitle).toBeInTheDocument();

        const ssnRow = await screen.findByRole('row', { name: 'SSN' });
        const ssnKind = within(ssnRow).getByText('Last 4');
        expect(ssnKind).toBeInTheDocument();

        await moveForward();

        // OTP
        const otpTitle = await screen.findByRole('heading', { name: 'OTP (one-time-passcode) verifications' });
        expect(otpTitle).toBeInTheDocument();

        await moveForward();

        // Verification checks
        const verificationChecks = await screen.findByRole('heading', { name: 'Verification checks' });
        expect(verificationChecks).toBeInTheDocument();

        await moveForward();
      });
    });
  });
});

const moveForward = async () => {
  const continueButton = screen.getByRole('button', { name: 'Continue' });
  await userEvent.click(continueButton);
};
