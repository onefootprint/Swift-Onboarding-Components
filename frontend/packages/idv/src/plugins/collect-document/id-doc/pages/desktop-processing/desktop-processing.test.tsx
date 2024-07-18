import { screen } from '@onefootprint/test-utils';
import React from 'react';

import DesktopProcessing from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import {
  initialContextBD,
  initialContextDL,
  initialContextDLBack,
  initialContextDLSelfie,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextPassport,
  initialContextVisa,
  initialContextWorkPermit,
  withSubmitDocBack,
  withSubmitDocFront,
  withSubmitDocSelfie,
} from './desktop-processing.test.config';

const renderDesktopProcessing = (context: MachineContext) =>
  renderPage(context, <DesktopProcessing />, 'desktopProcessing');

describe('<DesktopProcessing />', () => {
  describe('Contains all the UI elements', () => {
    beforeEach(() => {
      withSubmitDocFront();
    });
    it('Contains the title', () => {
      renderDesktopProcessing(initialContextDL);
      const title = screen.getByText("Driver's license · Front");
      expect(title).toBeInTheDocument();
    });

    it('Contains the subtitle', () => {
      renderDesktopProcessing(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderDesktopProcessing(initialContextDL);
      const continueButton = screen.getByText('Continue');
      expect(continueButton).toBeInTheDocument();
    });
  });

  describe('Contains the correct doc type in the title', () => {
    beforeEach(() => {
      withSubmitDocFront();
    });
    it('DL', () => {
      renderDesktopProcessing(initialContextDL);
      const title = screen.getByText("Driver's license · Front");
      expect(title).toBeInTheDocument();
    });

    it('Passport', () => {
      renderDesktopProcessing(initialContextPassport);
      const title = screen.getByText('Passport · Photo page');
      expect(title).toBeInTheDocument();
    });

    it('Visa', () => {
      renderDesktopProcessing(initialContextVisa);
      const title = screen.getByText('Visa · Photo page');
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderDesktopProcessing(initialContextGreenCard);
      const title = screen.getByText('Green card · Front');
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderDesktopProcessing(initialContextWorkPermit);
      const title = screen.getByText('EAD card · Front');
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderDesktopProcessing(initialContextIdCard);
      const title = screen.getByText('ID card · Front');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the subtitle', () => {
    beforeEach(() => {
      withSubmitDocFront();
    });
    it('US', () => {
      renderDesktopProcessing(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderDesktopProcessing(initialContextBD);
      const subtitle = screen.getByText('Issued in Bangladesh');
      expect(subtitle).toBeInTheDocument();
    });
  });

  describe('Contains the correct side in the title', () => {
    it('Back side', () => {
      withSubmitDocBack();
      renderDesktopProcessing(initialContextDLBack);
      const title = screen.getByText("Driver's license · Back");
      expect(title).toBeInTheDocument();
    });

    it('Selfie', () => {
      withSubmitDocSelfie();
      renderDesktopProcessing(initialContextDLSelfie);
      const title = screen.getByText('Selfie');
      expect(title).toBeInTheDocument();
    });
  });
});
