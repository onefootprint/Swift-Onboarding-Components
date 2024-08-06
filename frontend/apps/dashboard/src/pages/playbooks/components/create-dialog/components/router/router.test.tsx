import { customRender, screen, userEvent, waitFor, within } from '@onefootprint/test-utils';

import type { RouterProps } from './router';
import Router from './router';
import { createPlaybook, moveBack, moveForward, withCreateOnboardingConfigs } from './router.test.config';

const renderRouter = (
  { onCreate }: RouterProps = {
    onCreate: jest.fn(),
  },
) => customRender(<Router onCreate={onCreate} />);

describe('<Router />', () => {
  describe('Auth playbook', () => {
    it('should create an onboarding config and show a confirmation', async () => {
      const onCreate = jest.fn();
      withCreateOnboardingConfigs();
      renderRouter({ onCreate });

      // Kind
      const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
      expect(kindStep).toBeInTheDocument();

      const authOption = screen.getByRole('button', { name: 'Auth' });
      await userEvent.click(authOption);
      await moveForward();

      // Name
      const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
      expect(nameStep).toBeInTheDocument();
      await moveForward();

      // Create
      await createPlaybook();
      await waitFor(() => {
        const confirmation = screen.getByText('Playbook created successfully.');
        expect(confirmation).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalled();
      });
    });
  });

  describe('DocOnly playbook', () => {
    it('should create an onboarding config and show a confirmation', async () => {
      const onCreate = jest.fn();
      withCreateOnboardingConfigs();
      renderRouter({ onCreate });

      // Kind
      const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
      expect(kindStep).toBeInTheDocument();

      const docOnlyOption = screen.getByRole('button', { name: 'Document only' });
      await userEvent.click(docOnlyOption);
      await moveForward();

      // Name
      const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
      expect(nameStep).toBeInTheDocument();
      await moveForward();

      // Details
      const govDocs = screen.getByRole('region', { name: 'Collect government-issued ID' });
      const addButton = within(govDocs).getByRole('button', { name: 'Add' });
      await userEvent.click(addButton);

      const passportCheckbox = within(govDocs).getByRole('checkbox', { name: 'Passport' });
      await userEvent.click(passportCheckbox);

      const saveButton = within(govDocs).getByRole('button', { name: 'Save' });
      await userEvent.click(saveButton);

      // Create
      await createPlaybook();
      await waitFor(() => {
        const confirmation = screen.getByText('Playbook created successfully.');
        expect(confirmation).toBeInTheDocument();
      });
      await waitFor(() => {
        expect(onCreate).toHaveBeenCalled();
      });
    });
  });

  describe('KYC playbook', () => {
    it('should create an onboarding config and show a confirmation', async () => {
      const onCreate = jest.fn();
      withCreateOnboardingConfigs();

      renderRouter({ onCreate });

      // Kind
      const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
      expect(kindStep).toBeInTheDocument();
      await moveForward();

      // Templates
      const templatesStep = screen.getByRole('heading', { name: 'Templates' });
      expect(templatesStep).toBeInTheDocument();
      await moveForward();

      // Residency
      const residencyStep = screen.getByRole('heading', { name: 'Residency' });
      expect(residencyStep).toBeInTheDocument();
      await moveForward();

      // Name
      const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
      expect(nameStep).toBeInTheDocument();
      await moveForward();

      // Details
      const detailsStep = screen.getByRole('heading', { name: 'Your Playbook recommendation' });
      expect(detailsStep).toBeInTheDocument();
      await moveForward();

      // Verification checks
      const verificationChecks = screen.getByRole('heading', { name: 'Verification checks' });
      expect(verificationChecks).toBeInTheDocument;
      await createPlaybook();

      await waitFor(() => {
        const confirmation = screen.getByText('Playbook created successfully.');
        expect(confirmation).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(onCreate).toHaveBeenCalled();
      });
    });

    describe('when in the "Templates" step', () => {
      it('should go to "Playbook type" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        await moveForward();

        // Templates
        const templatesStep = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStep).toBeInTheDocument();
        await moveBack();

        // Kind step again
        const kindStepAgain = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStepAgain).toBeInTheDocument();
      });

      it('should go to "Residency" when clicking "Next" with "custom" selected', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        await moveForward();

        // Templates
        const templatesStep = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStep).toBeInTheDocument();
        const next = screen.getByRole('button', { name: 'Next' });
        await userEvent.click(next);

        // Residency
        const residencyStep = screen.getByRole('heading', { name: 'Residency' });
        expect(residencyStep).toBeInTheDocument();
      });

      it('should go to "Name your playbook" when clicking "Next" with "alpaca" selected', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        await moveForward();

        // Templates
        const templatesStep = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStep).toBeInTheDocument();

        await userEvent.click(screen.getByText('Alpaca'));
        await moveForward();

        // Name
        const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
        expect(nameStep).toBeInTheDocument();
      });
    });

    describe('when in the "Residency" step', () => {
      it('should go to "Templates" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        await moveForward();

        // Templates
        const templatesStep = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStep).toBeInTheDocument();
        await moveForward();

        // Residency
        const residencyStep = screen.getByRole('heading', { name: 'Residency' });
        expect(residencyStep).toBeInTheDocument();
        await moveBack();

        // Templates
        const templatesStepAgain = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStepAgain).toBeInTheDocument();
      });
    });

    describe('when in the "Name your Playbook" step', () => {
      it('should go to "Residency" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        await moveForward();

        // Templates
        const templatesStep = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStep).toBeInTheDocument();
        await moveForward();

        // Residency
        const residencyStep = screen.getByRole('heading', { name: 'Residency' });
        expect(residencyStep).toBeInTheDocument();
        await moveForward();

        // Name
        const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
        expect(nameStep).toBeInTheDocument();
        await moveBack();

        // Residency again
        const residencyStepAgain = screen.getByRole('heading', { name: 'Residency' });
        expect(residencyStepAgain).toBeInTheDocument();
      });

      it('should go to "Templates" when clicking "Back" if Alpaca was selected', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        await moveForward();

        // Templates
        const templatesStep = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStep).toBeInTheDocument();
        await userEvent.click(screen.getByText('Alpaca'));
        await moveForward();

        // Name
        const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
        expect(nameStep).toBeInTheDocument();
        await moveBack();

        // Templates
        const templatesStepAgain = screen.getByRole('heading', { name: 'Templates' });
        expect(templatesStepAgain).toBeInTheDocument();
      });

      describe('when in the "Details" step', () => {
        it('should go to "Name your Playbook" when clicking "Back"', async () => {
          renderRouter({ onCreate: jest.fn() });

          // Kind
          const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
          expect(kindStep).toBeInTheDocument();
          await moveForward();

          // Templates
          const templatesStep = screen.getByRole('heading', { name: 'Templates' });
          expect(templatesStep).toBeInTheDocument();
          await moveForward();

          // Residency
          const residencyStep = screen.getByRole('heading', { name: 'Residency' });
          expect(residencyStep).toBeInTheDocument();
          await moveForward();

          // Name
          const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
          expect(nameStep).toBeInTheDocument();
          await moveForward();

          // Details
          const detailsStep = screen.getByRole('heading', { name: 'Your Playbook recommendation' });
          expect(detailsStep).toBeInTheDocument();
          await moveBack();

          // Name
          const nameStepAgain = screen.getByText('Name your playbook');
          expect(nameStepAgain).toBeInTheDocument();
        });
      });

      describe('when in "verification checks" step', () => {
        it('should go to "Details" when clicking "Back"', async () => {
          renderRouter({ onCreate: jest.fn() });

          // Kind
          const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
          expect(kindStep).toBeInTheDocument();
          await moveForward();

          // Templates
          const templatesStep = screen.getByRole('heading', { name: 'Templates' });
          expect(templatesStep).toBeInTheDocument();
          await moveForward();

          // Residency
          const residencyStep = screen.getByRole('heading', { name: 'Residency' });
          expect(residencyStep).toBeInTheDocument();
          await moveForward();

          // Name
          const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
          expect(nameStep).toBeInTheDocument();
          await moveForward();

          // Details
          const detailsStep = screen.getByRole('heading', { name: 'Your Playbook recommendation' });
          expect(detailsStep).toBeInTheDocument();
          await moveForward();

          // Verification checks
          const verificationChecksStep = screen.getByRole('heading', { name: 'Verification checks' });
          expect(verificationChecksStep).toBeInTheDocument();
          await moveBack();

          // Details
          const detailsStepAgain = screen.getByRole('heading', { name: 'Your Playbook recommendation' });
          expect(detailsStepAgain).toBeInTheDocument();
        });
      });
    });
  });

  describe('KYB playbook', () => {
    it('should create an onboarding config and show a confirmation', async () => {
      withCreateOnboardingConfigs();
      renderRouter({ onCreate: jest.fn() });

      // Kind
      const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
      expect(kindStep).toBeInTheDocument();
      const kybOption = screen.getByRole('button', {
        name: 'Onboard businesses and their beneficial owners',
      });
      await userEvent.click(kybOption);
      await moveForward();

      // Name
      const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
      expect(nameStep).toBeInTheDocument();
      await moveForward();

      // Business
      const businessStep = screen.getByRole('heading', { name: 'Business information' });
      expect(businessStep).toBeInTheDocument();
      await moveForward();

      // BOs
      const bosStep = screen.getByRole('heading', { name: 'Business owners’ information' });
      expect(bosStep).toBeInTheDocument();
      await moveForward();

      // Verification checks
      const verificationChecks = screen.getByRole('heading', { name: 'Verification checks' });
      expect(verificationChecks).toBeInTheDocument();

      // Submit
      await createPlaybook();
      await waitFor(() => {
        const confirmation = screen.getByText('Playbook created successfully.');
        expect(confirmation).toBeInTheDocument();
      });
    });

    describe('when in the "Business" step', () => {
      it('should go to "Name" step when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        const kybOption = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(kybOption);
        await moveForward();

        // Name
        const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
        expect(nameStep).toBeInTheDocument();
        await moveBack();

        // Kind
        const kindStepAgain = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStepAgain).toBeInTheDocument();
      });
    });

    describe('when in the "Business owners’ information" step', () => {
      it('should go to "Business" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        const kybOption = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(kybOption);
        await moveForward();

        // Name
        const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
        expect(nameStep).toBeInTheDocument();
        await moveForward();

        // Business
        const businessStep = screen.getByRole('heading', { name: 'Business information' });
        expect(businessStep).toBeInTheDocument();
        await moveForward();

        // BOs
        const bosStep = screen.getByRole('heading', { name: 'Business owners’ information' });
        expect(bosStep).toBeInTheDocument();
        await moveBack();

        // Name
        const businessStepAgain = screen.getByRole('heading', { name: 'Business information' });
        expect(businessStepAgain).toBeInTheDocument();
      });
    });

    describe('when in "verification checks" step', () => {
      it('should go to "Business owners’ information" when clicking "Back"', async () => {
        renderRouter({ onCreate: jest.fn() });

        // Kind
        const kindStep = screen.getByRole('heading', { name: 'What type of playbook would you like to create?' });
        expect(kindStep).toBeInTheDocument();
        const kybOption = screen.getByRole('button', {
          name: 'Onboard businesses and their beneficial owners',
        });
        await userEvent.click(kybOption);
        await moveForward();

        // Name
        const nameStep = screen.getByRole('heading', { name: 'Name your playbook' });
        expect(nameStep).toBeInTheDocument();
        await moveForward();

        // Business
        const businessStep = screen.getByRole('heading', { name: 'Business information' });
        expect(businessStep).toBeInTheDocument();
        await moveForward();

        // BOs
        const bosStep = screen.getByRole('heading', { name: 'Business owners’ information' });
        expect(bosStep).toBeInTheDocument();
        await moveForward();

        // Verification checks
        const verificationChecks = screen.getByRole('heading', { name: 'Verification checks' });
        expect(verificationChecks).toBeInTheDocument();
        await moveBack();

        const bosStepAgain = screen.getByRole('heading', { name: 'Business owners’ information' });
        expect(bosStepAgain).toBeInTheDocument();
      });
    });
  });
});
