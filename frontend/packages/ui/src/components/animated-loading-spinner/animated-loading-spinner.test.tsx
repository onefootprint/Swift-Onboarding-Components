import '../../config/initializers/i18next-test';

import { customRender, screen } from '@onefootprint/test-utils';

import type { AnimatedLoadingSpinnerProps } from './animated-loading-spinner';
import AnimatedLoadingSpinner from './animated-loading-spinner';

describe('<AnimatedLoadingSpinner />', () => {
  const renderAnimatedLoadingSpinner = ({ ariaLabel, animationStart = false }: Partial<AnimatedLoadingSpinnerProps>) =>
    customRender(<AnimatedLoadingSpinner ariaLabel={ariaLabel} animationStart={animationStart} />);

  it('should add an aria label', () => {
    const ariaLabel = 'loading';
    renderAnimatedLoadingSpinner({ ariaLabel });
    expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument();
  });
});
