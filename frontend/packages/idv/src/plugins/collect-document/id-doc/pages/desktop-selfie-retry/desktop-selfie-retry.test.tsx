import { screen } from '@onefootprint/test-utils';

import DesktopSelfieRetry from '.';
import renderPage from '../../test-utils/render-page';
import type { MachineContext } from '../../utils/state-machine';
import initialContextWithErrors from './desktop-selfie-retry.test.config';

const renderDesktopSelfieRetry = (context: MachineContext) =>
  renderPage(context, <DesktopSelfieRetry />, 'desktopSelfieImageRetry');

describe('<DesktopSelfieRetry />', () => {
  describe('Contains all the UI elements', () => {
    it('Contains the title', () => {
      renderDesktopSelfieRetry(initialContextWithErrors);
      const title = screen.getByText('Selfie');
      expect(title).toBeInTheDocument();
    });

    it('Contains the take again button', () => {
      renderDesktopSelfieRetry(initialContextWithErrors);
      const diffFileButton = screen.getByText('Take selfie again');
      expect(diffFileButton).toBeInTheDocument();
    });
  });

  it('Contains the correct error messages', () => {
    renderDesktopSelfieRetry(initialContextWithErrors);

    const error = screen.getByText('Your selfie had too much glare. Please adjust the lighting and try again.');

    expect(error).toBeInTheDocument();
  });
});
