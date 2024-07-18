import { screen } from '@onefootprint/test-utils';
import React from 'react';

import DesktopBackPhotoRetry from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import {
  initialContextBD,
  initialContextDL,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextWithErrors,
  initialContextWorkPermit,
} from './desktop-back-photo-retry.test.config';

const renderDesktopBackPhotoRetry = (context: MachineContext) =>
  renderPage(context, <DesktopBackPhotoRetry />, 'desktopBackImageRetry');

describe('<DesktopBackPhotoRetry />', () => {
  describe('Contains all the UI elements', () => {
    it('Contains the title', () => {
      renderDesktopBackPhotoRetry(initialContextDL);
      const title = screen.getByText("Driver's license · Back");
      expect(title).toBeInTheDocument();
    });

    it('Contains the subtitle', () => {
      renderDesktopBackPhotoRetry(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderDesktopBackPhotoRetry(initialContextDL);
      const diffFileButton = screen.getByText('Choose a different file');
      expect(diffFileButton).toBeInTheDocument();
    });

    it('Contains upload input', async () => {
      renderDesktopBackPhotoRetry(initialContextDL);
      const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
      expect(uploadInput).toBeInTheDocument();
      expect(uploadInput.getAttribute('accept')).toEqual('image/*');
    });
  });

  describe('Contains the correct doc type in the title', () => {
    it('DL', () => {
      renderDesktopBackPhotoRetry(initialContextDL);
      const title = screen.getByText("Driver's license · Back");
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderDesktopBackPhotoRetry(initialContextGreenCard);
      const title = screen.getByText('Green card · Back');
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderDesktopBackPhotoRetry(initialContextWorkPermit);
      const title = screen.getByText('EAD card · Back');
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderDesktopBackPhotoRetry(initialContextIdCard);
      const title = screen.getByText('ID card · Back');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the subtitle', () => {
    it('US', () => {
      renderDesktopBackPhotoRetry(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderDesktopBackPhotoRetry(initialContextBD);
      const subtitle = screen.getByText('Issued in Bangladesh');
      expect(subtitle).toBeInTheDocument();
    });
  });

  it('Contains the correct error messages', () => {
    renderDesktopBackPhotoRetry(initialContextWithErrors);

    const error1 = screen.getByText(
      "The driver's license issuer country didn't match. Please upload your driver's license from United States of America.",
    );
    const error2 = screen.getByText(
      "It looks like you uploaded the wrong side of your document. Please flip your ID and upload the back of your driver's license from United States of America.",
    );
    const error3 = screen.getByText('The uploaded file type is not supported. Please upload image files only.');

    expect(error1).toBeInTheDocument();
    expect(error2).toBeInTheDocument();
    expect(error3).toBeInTheDocument();
  });
});
