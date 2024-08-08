import { screen } from '@onefootprint/test-utils';

import IdDocPhotoRetryPrompt from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import contextWithErrors, { contextWithSelfieErrors } from './capture-retry-prompt.test.config';

const renderFrontPhotoRetry = (context: MachineContext) =>
  renderPage(
    context,
    <IdDocPhotoRetryPrompt imageType="front" onComplete={() => undefined} />,
    'mobileFrontImageRetry',
  );

const renderBackPhotoRetry = (context: MachineContext) =>
  renderPage(context, <IdDocPhotoRetryPrompt imageType="back" onComplete={() => undefined} />, 'mobileBackImageRetry');

const renderSelfieRetryPrompt = (context: MachineContext) =>
  renderPage(
    context,
    <IdDocPhotoRetryPrompt imageType="selfie" onComplete={() => undefined} />,
    'mobileSelfieImageRetry',
  );

describe('<IdDocPhotoRetryPrompt front />', () => {
  it('should contains the correct error messages', () => {
    renderFrontPhotoRetry(contextWithErrors);

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

  it('should contains take photo button', async () => {
    renderFrontPhotoRetry(contextWithErrors);
    const takeButton = screen.getByText('Take photo');
    expect(takeButton).toBeInTheDocument();
  });

  it('should contains upload photo button', async () => {
    renderFrontPhotoRetry(contextWithErrors);
    const uploadButton = screen.getByText('Upload photo');
    expect(uploadButton).toBeInTheDocument();
  });

  it('should contains upload input', async () => {
    renderFrontPhotoRetry(contextWithErrors);
    const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
    expect(uploadInput).toBeInTheDocument();
    expect(uploadInput.getAttribute('accept')).toEqual('image/*');
  });
});

describe('<IdDocPhotoRetryPrompt back />', () => {
  it('should contains the correct error messages', () => {
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

  it('should contains take photo button', async () => {
    renderBackPhotoRetry(contextWithErrors);
    const takeButton = screen.getByText('Take photo');
    expect(takeButton).toBeInTheDocument();
  });

  it('should contains upload photo button', async () => {
    renderBackPhotoRetry(contextWithErrors);
    const uploadButton = screen.getByText('Upload photo');
    expect(uploadButton).toBeInTheDocument();
  });

  it('should contains upload input', async () => {
    renderBackPhotoRetry(contextWithErrors);
    const uploadInput = screen.getByLabelText('file-input') as HTMLInputElement;
    expect(uploadInput).toBeInTheDocument();
    expect(uploadInput.getAttribute('accept')).toEqual('image/*');
  });
});

describe('<IdDocPhotoRetryPrompt selfie />', () => {
  it('should contains the correct error messages', () => {
    renderSelfieRetryPrompt(contextWithSelfieErrors);
    const error1 = screen.getByText('Your selfie had too much glare. Please adjust the lighting and try again.');
    expect(error1).toBeInTheDocument();
  });

  it('should contains take photo button', async () => {
    renderSelfieRetryPrompt(contextWithSelfieErrors);
    const takeButton = screen.getByText('Take photo');
    expect(takeButton).toBeInTheDocument();
  });

  it('should not contains upload photo button', async () => {
    renderSelfieRetryPrompt(contextWithSelfieErrors);
    const uploadButton = screen.queryAllByText('Upload photo');
    expect(uploadButton).toHaveLength(0);
  });
});
