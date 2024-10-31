import { customRender, screen, userEvent, waitFor } from '@onefootprint/test-utils';
import { OnboardingRequirementKind, OverallOutcome } from '@onefootprint/types';
import { Layout } from '../../components/';
import CreateBusinessOnboarding from './create-business-onboarding';
import { withBusinessOnboarding, withBusinesses, withNoBusinesses } from './create-business-onboarding.test.config';

describe('<CreateBusinessOnboarding />', () => {
  beforeEach(() => {
    withBusinessOnboarding();
  });

  describe('when it requires a selection', () => {
    const renderCreateBusinessOnboarding = ({ onDone = jest.fn() }: { onDone?: () => void } = {}) => {
      return customRender(
        <Layout>
          <CreateBusinessOnboarding
            context={{
              requirement: {
                kind: OnboardingRequirementKind.createBusinessOnboarding,
                requiresBusinessSelection: true,
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
          />
        </Layout>,
      );
    };

    describe('when there are no businesses associated to the user', () => {
      beforeEach(() => {
        withNoBusinesses();
      });

      it('should show the new business introduction screen', async () => {
        renderCreateBusinessOnboarding({});
        const title = await screen.findByText("Let's get to know your business!", { exact: false });
        expect(title).toBeInTheDocument();
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
          renderCreateBusinessOnboarding({ onDone });

          const btn = await screen.findByRole('button', { name: 'Add & verify a new business' });
          await userEvent.click(btn);

          const introTitle = await screen.findByText("Let's get to know your business!", { exact: false });
          expect(introTitle).toBeInTheDocument();

          const continueBtn = await screen.findByRole('button', { name: 'Continue' });
          await userEvent.click(continueBtn);

          await waitFor(() => {
            expect(onDone).toHaveBeenCalled();
          });
        });
      });

      describe('when clicking on a business', () => {
        it('should trigger onDone', async () => {
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
});
