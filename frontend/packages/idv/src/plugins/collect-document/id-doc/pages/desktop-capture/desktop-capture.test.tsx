import { screen } from '@onefootprint/test-utils';

import DesktopCapture from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import { initialContextDL } from '../../utils/state-machine/machine.test.config';
import {
  initialContextBD,
  initialContextGreenCard,
  initialContextIdCard,
  initialContextPassport,
  initialContextVisa,
  initialContextVoterId,
  initialContextWithErrors,
  initialContextWorkPermit,
} from './desktop-capture.test.config';

const noop = () => () => undefined;

const renderDesktopBackPhoto = (context: MachineContext) =>
  renderPage(context, <DesktopCapture imageType="back" onBack={noop} onComplete={noop} />, 'desktopBackImage');

const renderDesktopFrontPhoto = (context: MachineContext) =>
  renderPage(context, <DesktopCapture imageType="front" onBack={noop} onComplete={noop} />, 'desktopFrontImage');

const renderDesktopBackPhotoRetry = (context: MachineContext) =>
  renderPage(
    context,
    <DesktopCapture imageType="back" isRetry onBack={noop} onComplete={noop} />,
    'desktopBackImageRetry',
  );

const renderDesktopFrontPhotoRetry = (context: MachineContext) =>
  renderPage(
    context,
    <DesktopCapture imageType="front" isRetry onBack={noop} onComplete={noop} />,
    'desktopFrontImageRetry',
  );

describe('<DesktopCapture back />', () => {
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

describe('<DesktopCapture front />', () => {
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
      const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
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

describe('<DesktopCapture back retry />', () => {
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

describe('<DesktopCapture front retry />', () => {
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
