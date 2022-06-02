import React from 'react';
import { customRender, screen } from 'test-utils';

import Header, { HeaderButtonType, HeaderProps } from './header';

describe('<Header />', () => {
  const renderHeader = ({
    buttonType,
    progressIndicatorProps,
    onPrev,
    onClose,
  }: HeaderProps) =>
    customRender(
      <Header
        buttonType={buttonType}
        progressIndicatorProps={progressIndicatorProps}
        onPrev={onPrev}
        onClose={onClose}
      />,
    );

  it('should render close button', () => {
    renderHeader({
      buttonType: HeaderButtonType.close,
    });
    expect(screen.getByLabelText('Close window')).toBeInTheDocument();
  });

  it('should render prev button', () => {
    renderHeader({
      buttonType: HeaderButtonType.prev,
    });
    expect(screen.getByLabelText('Previous window')).toBeInTheDocument();
  });

  it('should render progress indicator', () => {
    renderHeader({
      buttonType: HeaderButtonType.prev,
      progressIndicatorProps: { max: 3, value: 2 },
    });
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(screen.getByLabelText('Previous window')).toBeInTheDocument();
  });
});
