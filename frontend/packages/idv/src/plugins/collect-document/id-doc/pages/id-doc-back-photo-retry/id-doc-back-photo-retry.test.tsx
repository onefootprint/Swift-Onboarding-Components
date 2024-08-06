import { screen } from '@onefootprint/test-utils';

import IdDocBackPhotoRetry from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import contextWithErrors from './id-doc-back-photo-retry.test.config';

const renderBackPhotoRetry = (context: MachineContext) =>
  renderPage(context, <IdDocBackPhotoRetry />, 'mobileBackImageRetry');

describe('<IdDocBackPhotoRetry />', () => {
  it('Contains the correct error messages', () => {
    renderBackPhotoRetry(contextWithErrors);

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

  it('Contains take photo button', async () => {
    renderBackPhotoRetry(contextWithErrors);
    const takeButton = screen.getByText('Take photo');
    expect(takeButton).toBeInTheDocument();
  });

  it('Contains upload photo button', async () => {
    renderBackPhotoRetry(contextWithErrors);
    const uploadButton = screen.getByText('Upload photo');
    expect(uploadButton).toBeInTheDocument();
  });

  it('Contains upload input', async () => {
    renderBackPhotoRetry(contextWithErrors);
    const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
    expect(uploadInput).toBeInTheDocument();
    expect(uploadInput.getAttribute('accept')).toEqual('image/*');
  });
});
