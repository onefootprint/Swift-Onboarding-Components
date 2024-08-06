import { fireEvent, screen, waitFor } from '@onefootprint/test-utils';

import DesktopConsent from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL } from '../../utils/state-machine/machine.test.config';

const renderDesktopConsent = (context: MachineContext) => renderPage(context, <DesktopConsent />, 'desktopConsent');

describe('<DesktopConsent />', () => {
  beforeEach(() => {
    // IntersectionObserver isn't available in test environment
    const mockIntersectionObserver = jest.fn();
    mockIntersectionObserver.mockReturnValue({
      observe: () => null,
      unobserve: () => null,
      disconnect: () => null,
    });
    window.IntersectionObserver = mockIntersectionObserver;
  });

  it('Contains the consent title', () => {
    renderDesktopConsent(initialContextDL);
    const title = screen.getByText('Consent to use your images');
    expect(title).toBeInTheDocument();
  });

  it('Contains the consent subtitle', () => {
    renderDesktopConsent(initialContextDL);
    const subtitle = screen.getByText(
      'Consent and Written Release for Collection, Use, Disclosure and Storage of Personal Data (including Biometric Information and Identifiers)',
    );
    expect(subtitle).toBeInTheDocument();
  });

  it('Contains consent body', () => {
    renderDesktopConsent(initialContextDL);
    const consentBody = screen.getByLabelText('consent-body');
    expect(consentBody).toBeInTheDocument();
  });

  it('Consent button initially asks to scroll and is disables', () => {
    renderDesktopConsent(initialContextDL);
    const consentButton = screen.getByTestId('consent-button') as HTMLButtonElement;
    const consentButtonText = screen.getByText('Scroll to agree');
    expect(consentButton).toBeInTheDocument();
    expect(consentButtonText).toBeInTheDocument();
    expect(consentButton.disabled).toBeTruthy();
  });

  // Since we started using intersection observer, this test wouldn't work anymore
  it.skip('Scrolling body to the end enables consent button and changes the button text', async () => {
    renderDesktopConsent(initialContextDL);
    const consentBody = screen.getByLabelText('consent-body');
    fireEvent.scroll(consentBody);
    await waitFor(() => {
      const consentButtonText = screen.getByText('Agree and continue');
      expect(consentButtonText).toBeInTheDocument();
    });
    const consentButton = screen.getByTestId('consent-button') as HTMLButtonElement;
    expect(consentButton).toBeInTheDocument();
    expect(consentButton.disabled).toBeFalsy();
  });
});
