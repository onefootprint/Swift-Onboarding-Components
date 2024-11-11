import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { OnboardingRequirementKind, OverallOutcome } from '@onefootprint/types';
import { Layout } from '../../components/';
import CreateBusinessOnboarding from './create-business-onboarding';
import {
  withBusinessOnboarding,
  withBusinessOwners,
  withBusinessUpdate,
  withBusinesses,
  withNoBusinesses,
} from './create-business-onboarding.test.config';

const renderCreateBusinessOnboarding = ({
  requiresBusinessSelection = true,
  bootstrapBusinessData = {},
  onDone = jest.fn(),
  onError = jest.fn(),
}: {
  requiresBusinessSelection?: boolean;
  bootstrapBusinessData?: {};
  onDone?: () => void;
  onError?: () => void;
}) => {
  return customRender(
    <Layout>
      <CreateBusinessOnboarding
        context={{
          bootstrapBusinessData,
          bootstrapUserData: {},
          requirement: {
            kind: OnboardingRequirementKind.createBusinessOnboarding,
            requiresBusinessSelection,
          },
          overallOutcome: OverallOutcome.success,
        }}
        idvContext={{
          device: {
            hasSupportForWebauthn: true,
            browser: 'Chrome',
            osName: 'Mac OS',
            type: 'unknown',
            initialCameraPermissionState: 'granted',
          },
          authToken: 'utok_h',
          isInIframe: true,
        }}
        onDone={onDone}
        onError={onError}
      />
    </Layout>,
  );
};

describe('<CreateBusinessOnboarding />', () => {
  describe('when it requires a selection', () => {
    describe('when there are no businesses associated to the user', () => {
      beforeEach(() => {
        withNoBusinesses();
      });

      it('should show the new business introduction screen', async () => {
        withBusinessOnboarding(true);
        renderCreateBusinessOnboarding({});
        await waitFor(() => {
          const introTitle = screen.queryByText("Let's get to know your business!", { exact: false });
          expect(introTitle).toBeInTheDocument();
        });
      });
    });

    describe('when there are businesses associated to the user', () => {
      beforeEach(() => {
        withBusinesses();
      });

      it('should show the businesses list', async () => {
        renderCreateBusinessOnboarding({});
        const businessName = await screen.findByText('Acme Bank');
        expect(businessName).toBeInTheDocument();
      });

      describe('when clicking on the "add" button', () => {
        it('should show the new business introduction', async () => {
          const onDone = jest.fn();
          withBusinessOnboarding(true);
          renderCreateBusinessOnboarding({ onDone });

          const btn = await screen.findByRole('button', { name: 'Add & verify a new business' });
          await userEvent.click(btn);

          await waitFor(() => {
            const introTitle = screen.queryByText("Let's get to know your business!", { exact: false });
            expect(introTitle).toBeInTheDocument();
          });

          const continueBtn = await screen.findByRole('button', { name: 'Continue' });
          await userEvent.click(continueBtn);

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });

      describe('when clicking on a business', () => {
        it('should trigger onDone', async () => {
          withBusinessOnboarding(false);
          const onDone = jest.fn();
          renderCreateBusinessOnboarding({ onDone });

          const business = await screen.findByText('Acme Bank');
          await userEvent.click(business);

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });
    });
  });

  describe('bootstrap data', () => {
    const bootstrapBusinessData = {
      'business.name': {
        value: 'Acme',
        isBootstrap: true,
      },
    };
    it('should bootstrap data when there are no business associated to the user', async () => {
      withNoBusinesses();
      withBusinessOnboarding(true);
      withBusinessUpdate();
      withBusinessOwners();

      const onDone = jest.fn();
      renderCreateBusinessOnboarding({ bootstrapBusinessData, onDone });

      await waitFor(() => {
        const introTitle = screen.queryByText("Let's get to know your business!", { exact: false });
        expect(introTitle).toBeInTheDocument();
      });

      const continueBtn = await screen.findByRole('button', { name: 'Continue' });
      await userEvent.click(continueBtn);
      expect(onDone).toHaveBeenCalled();
    });

    it('should bootstrap data when there are businesses associated, but the user clicks on add new', async () => {
      withBusinesses();
      withBusinessOnboarding(true);
      withBusinessUpdate();
      withBusinessOwners();

      const onDone = jest.fn();
      renderCreateBusinessOnboarding({ bootstrapBusinessData, onDone });

      const btn = await screen.findByRole('button', { name: 'Add & verify a new business' });
      await userEvent.click(btn);

      await waitFor(() => {
        const introTitle = screen.queryByText("Let's get to know your business!", { exact: false });
        expect(introTitle).toBeInTheDocument();
      });

      const continueBtn = await screen.findByRole('button', { name: 'Continue' });
      await userEvent.click(continueBtn);
      expect(onDone).toHaveBeenCalled();
    });

    it('should discard bootstrap data when user selects a business', async () => {
      withBusinesses();
      withBusinessOnboarding(false);

      const onDone = jest.fn();
      renderCreateBusinessOnboarding({ bootstrapBusinessData, onDone });

      const business = await screen.findByText('Acme Bank');
      await userEvent.click(business);

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });

  describe('does not require business selection', () => {
    it('should display intro when new', async () => {
      withBusinessOnboarding(true);

      const onDone = jest.fn();
      renderCreateBusinessOnboarding({ requiresBusinessSelection: false, onDone });

      await waitFor(() => {
        const introTitle = screen.queryByText("Let's get to know your business!", { exact: false });
        expect(introTitle).toBeInTheDocument();
      });

      const continueBtn = await screen.findByRole('button', { name: 'Continue' });
      await userEvent.click(continueBtn);
      expect(onDone).toHaveBeenCalled();
    });

    it('should not display intro when not new', async () => {
      withBusinessOnboarding(false);

      const onDone = jest.fn();
      renderCreateBusinessOnboarding({ requiresBusinessSelection: false, onDone });

      await waitFor(() => {
        expect(onDone).toHaveBeenCalled();
      });
    });
  });
});
