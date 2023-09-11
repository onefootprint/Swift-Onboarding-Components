import { fireEvent, screen, waitFor } from '@onefootprint/test-utils';
import React from 'react';

import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import DesktopConsent from '.';
import contextDesktopConsent from './desktop-consent.test.config';

const renderDesktopConsent = (context: MachineContext) =>
  renderPage(context, <DesktopConsent />, 'consentDesktop');

describe('<DesktopConsent />', () => {
  it('Contains the consent title', () => {
    renderDesktopConsent(contextDesktopConsent);
    const title = screen.getByText('Consent to use your images');
    expect(title).toBeInTheDocument();
  });

  it('Contains the consent subtitle', () => {
    renderDesktopConsent(contextDesktopConsent);
    const subtitle = screen.getByText(
      'Consent and Written Release for Collection, Use, Disclosure and Storage of Personal Data (including Biometric Information and Identifiers)',
    );
    expect(subtitle).toBeInTheDocument();
  });

  it('Contains consent body', () => {
    renderDesktopConsent(contextDesktopConsent);
    const consentBody = screen.getByLabelText('consent-body');
    expect(consentBody).toBeInTheDocument();
  });

  it('Consent button initially asks to scroll and is disables', () => {
    renderDesktopConsent(contextDesktopConsent);
    const consentButton = screen.getByTestId(
      'consent-button',
    ) as HTMLButtonElement;
    const consentButtonText = screen.getByText('Scroll to agree');
    expect(consentButton).toBeInTheDocument();
    expect(consentButtonText).toBeInTheDocument();
    expect(consentButton.disabled).toBeTruthy();
  });

  it('Scrolling body to the end enables consent button and changes the button text', async () => {
    renderDesktopConsent(contextDesktopConsent);
    const consentBody = screen.getByLabelText('consent-body');
    fireEvent.scroll(consentBody);
    await waitFor(() => {
      const consentButtonText = screen.getByText('Agree and continue');
      expect(consentButtonText).toBeInTheDocument();
    });
    const consentButton = screen.getByTestId(
      'consent-button',
    ) as HTMLButtonElement;
    expect(consentButton).toBeInTheDocument();
    expect(consentButton.disabled).toBeFalsy();
  });
});
