import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import type { LoadingSpinnerProps } from './loading-spinner';
import LoadingSpinner from './loading-spinner';

describe('<LoadingSpinner />', () => {
  const renderLoadingSpinner = ({ ariaLabel }: Partial<LoadingSpinnerProps>) =>
    customRender(<LoadingSpinner ariaLabel={ariaLabel} />);

  it('should add an aria label', () => {
    const ariaLabel = 'loading';
    renderLoadingSpinner({ ariaLabel });
    expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
  });
});
