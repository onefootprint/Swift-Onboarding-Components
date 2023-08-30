import { screen, userEvent } from '@onefootprint/test-utils';
import React from 'react';

import renderPage from '../../test-utils/render-page';
import { MachineContext } from '../../utils/state-machine';
import IdDocBackPhoto from '.';
import {
  initialContextBD,
  initialContextDL,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextWorkPermit,
} from './id-doc-back-photo.test.config';

const renderBackPhotoPrompt = (context: MachineContext) =>
  renderPage(context, <IdDocBackPhoto />);

describe('<IdDocFrontPhoto />', () => {
  describe('Contains the expected UI components', () => {
    it('Contains the front image title', () => {
      renderBackPhotoPrompt(initialContextDL);
      const title = screen.getByText(
        "Scan or upload the back side of your driver's license (USA)",
      );
      expect(title).toBeInTheDocument();
    });

    it('Contains the guideline texts', () => {
      renderBackPhotoPrompt(initialContextDL);
      const infoBox = screen.getByLabelText('infoBox');
      expect(infoBox).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderBackPhotoPrompt(initialContextDL);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('Should not the consent bottomsheet when continue is clicked', async () => {
      renderBackPhotoPrompt(initialContextDL);
      const continueButton = screen.getByText('Continue');
      await userEvent.click(continueButton);
      const consentSheeta = screen.queryAllByTestId('mobile-consent');
      expect(consentSheeta).toHaveLength(0);
    });
  });

  describe('Contains the correct doc type in the title', () => {
    it('DL', () => {
      renderBackPhotoPrompt(initialContextDL);
      const title = screen.getByText(
        "Scan or upload the back side of your driver's license (USA)",
      );
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderBackPhotoPrompt(initialContextGreenCard);
      const title = screen.getByText(
        'Scan or upload the back side of your green card (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderBackPhotoPrompt(initialContextWorkPermit);
      const title = screen.getByText(
        'Scan or upload the back side of your EAD card (USA)',
      );
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderBackPhotoPrompt(initialContextIdCard);
      const title = screen.getByText(
        'Scan or upload the back side of your ID card (USA)',
      );
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the title', () => {
    it('US', () => {
      renderBackPhotoPrompt(initialContextDL);
      const title = screen.getByText(
        "Scan or upload the back side of your driver's license (USA)",
      );
      expect(title).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderBackPhotoPrompt(initialContextBD);
      const title = screen.getByText(
        "Scan or upload the back side of your driver's license (BGD)",
      );
      expect(title).toBeInTheDocument();
    });
  });
});
