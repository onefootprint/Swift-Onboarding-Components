import { screen } from '@onefootprint/test-utils';
import React from 'react';

import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import DesktopFrontPhoto from '.';
import {
  initialContextBD,
  initialContextDL,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextPassport,
  initialContextVisa,
  initialContextVoterId,
  initialContextWorkPermit,
} from './desktop-front-photo.test.config';

const renderDesktopFrontPhoto = (context: MachineContext) =>
  renderPage(context, <DesktopFrontPhoto />, 'frontImageDesktop');

describe('<DesktopFrontPhoto />', () => {
  describe('Contains all the UI elements', () => {
    it('Contains the title', () => {
      renderDesktopFrontPhoto(initialContextDL);
      const title = screen.getByText("Driver's license · Front");
      expect(title).toBeInTheDocument();
    });

    it('Contains the subtitle', () => {
      renderDesktopFrontPhoto(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderDesktopFrontPhoto(initialContextDL);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('Contains upload input', async () => {
      renderDesktopFrontPhoto(initialContextDL);
      const uploadInput = screen.getByLabelText(
        'file-input',
      ) as HTMLInputElement;
      expect(uploadInput).toBeInTheDocument();
      expect(uploadInput.getAttribute('accept')).toEqual('image/*');
    });
  });

  describe('Contains the correct doc type in the title', () => {
    it('DL', () => {
      renderDesktopFrontPhoto(initialContextDL);
      const title = screen.getByText("Driver's license · Front");
      expect(title).toBeInTheDocument();
    });

    it('Passport', () => {
      renderDesktopFrontPhoto(initialContextPassport);
      const title = screen.getByText('Passport · Photo page');
      expect(title).toBeInTheDocument();
    });

    it('Visa', () => {
      renderDesktopFrontPhoto(initialContextVisa);
      const title = screen.getByText('Visa · Photo page');
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderDesktopFrontPhoto(initialContextGreenCard);
      const title = screen.getByText('Green card · Front');
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderDesktopFrontPhoto(initialContextWorkPermit);
      const title = screen.getByText('EAD card · Front');
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderDesktopFrontPhoto(initialContextIdCard);
      const title = screen.getByText('ID card · Front');
      expect(title).toBeInTheDocument();
    });

    it('Voter id', () => {
      renderDesktopFrontPhoto(initialContextVoterId);
      const title = screen.getByText('Voter identification · Front');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the subtitle', () => {
    it('US', () => {
      renderDesktopFrontPhoto(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderDesktopFrontPhoto(initialContextBD);
      const subtitle = screen.getByText('Issued in Bangladesh');
      expect(subtitle).toBeInTheDocument();
    });
  });
});
