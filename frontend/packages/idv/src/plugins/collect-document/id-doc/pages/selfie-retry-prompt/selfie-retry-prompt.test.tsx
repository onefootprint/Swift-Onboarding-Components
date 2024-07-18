import { screen } from '@onefootprint/test-utils';
import React from 'react';

import SelfieRetryPrompt from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import contextWithSelfieErrors from './selfie-retry-prompt.test.config';

const renderSelfieRetryPrompt = (context: MachineContext) =>
  renderPage(context, <SelfieRetryPrompt />, 'mobileSelfieImageRetry');

describe('<SelfieRetryPrompt />', () => {
  it('Contains the correct error messages', () => {
    renderSelfieRetryPrompt(contextWithSelfieErrors);
    const error1 = screen.getByText('Your selfie had too much glare. Please adjust the lighting and try again.');
    expect(error1).toBeInTheDocument();
  });

  it('Contains take photo button', async () => {
    renderSelfieRetryPrompt(contextWithSelfieErrors);
    const takeButton = screen.getByText('Take photo');
    expect(takeButton).toBeInTheDocument();
  });

  it('Doesn not contains upload photo button', async () => {
    renderSelfieRetryPrompt(contextWithSelfieErrors);
    const uploadButton = screen.queryAllByText('Upload photo');
    expect(uploadButton).toHaveLength(0);
  });
});
