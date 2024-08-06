import { screen } from '@onefootprint/test-utils';

import DesktopFrontPhotoRetry from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL } from '../../utils/state-machine/machine.test.config';
import {
  initialContextBD,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextPassport,
  initialContextVisa,
  initialContextWithErrors,
  initialContextWorkPermit,
} from './desktop-front-photo-retry.test.config';

const renderDesktopFrontPhotoRetry = (context: MachineContext) =>
  renderPage(context, <DesktopFrontPhotoRetry />, 'desktopFrontImageRetry');

describe('<DesktopFrontPhotoRetry />', () => {
  describe('Contains all the UI elements', () => {
    it('Contains the title', () => {
      renderDesktopFrontPhotoRetry(initialContextDL);
      const title = screen.getByText("Driver's license · Front");
      expect(title).toBeInTheDocument();
    });

    it('Contains the subtitle', () => {
      renderDesktopFrontPhotoRetry(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Contains the continue button', () => {
      renderDesktopFrontPhotoRetry(initialContextDL);
      const diffFileButton = screen.getByText('Choose a different file');
      expect(diffFileButton).toBeInTheDocument();
    });

    it('Contains upload input', async () => {
      renderDesktopFrontPhotoRetry(initialContextDL);
      const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
      expect(uploadInput).toBeInTheDocument();
      expect(uploadInput.getAttribute('accept')).toEqual('image/*');
    });
  });

  describe('Contains the correct doc type in the title', () => {
    it('DL', () => {
      renderDesktopFrontPhotoRetry(initialContextDL);
      const title = screen.getByText("Driver's license · Front");
      expect(title).toBeInTheDocument();
    });

    it('Passport', () => {
      renderDesktopFrontPhotoRetry(initialContextPassport);
      const title = screen.getByText('Passport · Photo page');
      expect(title).toBeInTheDocument();
    });

    it('Visa', () => {
      renderDesktopFrontPhotoRetry(initialContextVisa);
      const title = screen.getByText('Visa · Photo page');
      expect(title).toBeInTheDocument();
    });

    it('Residence card', () => {
      renderDesktopFrontPhotoRetry(initialContextGreenCard);
      const title = screen.getByText('Green card · Front');
      expect(title).toBeInTheDocument();
    });

    it('work permit', () => {
      renderDesktopFrontPhotoRetry(initialContextWorkPermit);
      const title = screen.getByText('EAD card · Front');
      expect(title).toBeInTheDocument();
    });

    it('ID card', () => {
      renderDesktopFrontPhotoRetry(initialContextIdCard);
      const title = screen.getByText('ID card · Front');
      expect(title).toBeInTheDocument();
    });
  });

  describe('Contains the correct country in the subtitle', () => {
    it('US', () => {
      renderDesktopFrontPhotoRetry(initialContextDL);
      const subtitle = screen.getByText('Issued in United States of America');
      expect(subtitle).toBeInTheDocument();
    });

    it('Bangladesh', () => {
      renderDesktopFrontPhotoRetry(initialContextBD);
      const subtitle = screen.getByText('Issued in Bangladesh');
      expect(subtitle).toBeInTheDocument();
    });
  });

  it('Contains the correct error messages', () => {
    renderDesktopFrontPhotoRetry(initialContextWithErrors);

    const error1 = screen.getByText(
      "The driver's license issuer country didn't match. Please upload your driver's license from United States of America.",
    );
    const error2 = screen.getByText(
      "It looks like you uploaded the wrong side of your document. Please flip your ID and upload the front of your driver's license from United States of America.",
    );
    const error3 = screen.getByText('The uploaded file type is not supported. Please upload image files only.');

    expect(error1).toBeInTheDocument();
    expect(error2).toBeInTheDocument();
    expect(error3).toBeInTheDocument();
  });
});
