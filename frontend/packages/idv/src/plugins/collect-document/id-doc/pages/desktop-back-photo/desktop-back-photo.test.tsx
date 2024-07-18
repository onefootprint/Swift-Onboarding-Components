import { screen } from '@onefootprint/test-utils';
import React from 'react';

import DesktopBackPhoto from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import {
  initialContextBD,
  initialContextDL,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextWorkPermit,
} from './desktop-back-photo.test.config';

const renderDesktopBackPhoto = (context: MachineContext) =>
  renderPage(context, <DesktopBackPhoto />, 'desktopBackImage');

describe('<DesktopBackPhoto />', () => {
  describe('Contains all the UI elements', () => {
    it('Contains the title', () => {
      renderDesktopBackPhoto(initialContextDL);
      const title = screen.getByText("Driver's license · Back");
      expect(title).toBeInTheDocument();
    });

    it('Contains the subtitle', () => {
      renderDesktopBackPhoto(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderDesktopBackPhoto(initialContextDL);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });

    it('Contains upload input', async () => {
      renderDesktopBackPhoto(initialContextDL);
      const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
      expect(uploadInput).toBeInTheDocument();
      expect(uploadInput.getAttribute('accept')).toEqual('image/*');
    });
  });

  describe('Contains the correct doc type in the title', () => {
    it('DL', () => {
      renderDesktopBackPhoto(initialContextDL);
      const title = screen.getByText("Driver's license · Back");
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderDesktopBackPhoto(initialContextGreenCard);
      const title = screen.getByText('Green card · Back');
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderDesktopBackPhoto(initialContextWorkPermit);
      const title = screen.getByText('EAD card · Back');
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderDesktopBackPhoto(initialContextIdCard);
      const title = screen.getByText('ID card · Back');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the subtitle', () => {
    it('US', () => {
      renderDesktopBackPhoto(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderDesktopBackPhoto(initialContextBD);
      const subtitle = screen.getByText('Issued in Bangladesh');
      expect(subtitle).toBeInTheDocument();
    });
  });
});
