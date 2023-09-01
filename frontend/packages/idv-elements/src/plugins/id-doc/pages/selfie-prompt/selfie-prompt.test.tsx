import { screen } from '@onefootprint/test-utils';
import React from 'react';

import renderPage from '../../test-utils/render-page';
import { MachineContext } from '../../utils/state-machine';
import SelfiePrompt from '.';
import selfiePromptStateContext from './selfie-prompt.test.config';

const renderBackPhotoPrompt = (context: MachineContext) =>
  renderPage(context, <SelfiePrompt />, 'selfiePromptMobile');

describe('<SelfiePrompt />', () => {
  it('Contains the correct title', () => {
    renderBackPhotoPrompt(selfiePromptStateContext);
    const title = screen.getByText('Take a selfie');
    expect(title).toBeInTheDocument();
  });

  it('Contains the guideline texts', () => {
    renderBackPhotoPrompt(selfiePromptStateContext);
    const infoBox = screen.getByLabelText('infoBox');
    expect(infoBox).toBeInTheDocument();
  });

  it('Contains the take button', () => {
    renderBackPhotoPrompt(selfiePromptStateContext);
    const continueButton = screen.getByText('Take photo');
    expect(continueButton).toBeInTheDocument();
  });
});
