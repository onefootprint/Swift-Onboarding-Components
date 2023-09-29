import { screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import IdDocFrontPhoto from '.';
import {
  initialContextBD,
  initialContextDL,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextNoConsent,
  initialContextPassport,
  initialContextVisa,
  initialContextVoterId,
  initialContextWorkPermit,
} from './id-doc-front-photo.test.config';

const renderFrontPhotoPrompt = (context: MachineContext) =>
  renderPage(context, <IdDocFrontPhoto />);

describe('<IdDocFrontPhoto />', () => {
  describe('Contains the expected UI components', () => {
    it('Contains the front image title', () => {
      renderFrontPhotoPrompt(initialContextDL);
      const title = screen.getByText(
        "Scan or upload the front side of your driver's license (USA)",
      );
      expect(title).toBeInTheDocument();
    });

    it('Contains the guideline texts', () => {
      renderFrontPhotoPrompt(initialContextDL);
      const infoBox = screen.getByLabelText('infoBox');
      expect(infoBox).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderFrontPhotoPrompt(initialContextDL);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('Shows the consent bottomsheet when continue is clicked', async () => {
      renderFrontPhotoPrompt(initialContextDL);
      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);
      const consentSheet = await screen.findByTestId('mobile-consent');
      expect(consentSheet).toBeInTheDocument();
    });
  });

  describe('Contains the correct doc type in the title', () => {
    it('DL', () => {
      renderFrontPhotoPrompt(initialContextDL);
      const title = screen.getByText(
        "Scan or upload the front side of your driver's license (USA)",
      );
      expect(title).toBeInTheDocument();
    });

    it('Passport', () => {
      renderFrontPhotoPrompt(initialContextPassport);
      const title = screen.getByText(
        'Scan or upload the photo page of your passport (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('Visa', () => {
      renderFrontPhotoPrompt(initialContextVisa);
      const title = screen.getByText(
        'Scan or upload the photo page of your visa (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderFrontPhotoPrompt(initialContextGreenCard);
      const title = screen.getByText(
        'Scan or upload the front side of your green card (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderFrontPhotoPrompt(initialContextWorkPermit);
      const title = screen.getByText(
        'Scan or upload the front side of your EAD card (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderFrontPhotoPrompt(initialContextIdCard);
      const title = screen.getByText(
        'Scan or upload the front side of your ID card (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('Voter ID', () => {
      renderFrontPhotoPrompt(initialContextVoterId);
      const title = screen.getByText(
        'Scan or upload the front side of your voter identification (USA)',
      );
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the title', () => {
    it('US', () => {
      renderFrontPhotoPrompt(initialContextDL);
      const title = screen.getByText(
        "Scan or upload the front side of your driver's license (USA)",
      );
      expect(title).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderFrontPhotoPrompt(initialContextBD);
      const title = screen.getByText(
        'Scan or upload the photo page of your passport (BGD)',
      );
      expect(title).toBeInTheDocument();
    });
  });

  describe('If consent is not required, does not prompt it', () => {
    it('If consent is not required, does not prompt it', async () => {
      renderFrontPhotoPrompt(initialContextNoConsent);
      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);
      const consentSheeta = screen.queryAllByTestId('mobile-consent');
      expect(consentSheeta).toHaveLength(0);
    });
  });
});
