import { customRender, screen, userEvent } from '@onefootprint/test-utils';
import { ChallengeKind } from '@onefootprint/types';
import React from 'react';

import LoginChallengeSegmentedControl, {
  LoginChallengeSegmentedControlProps,
} from './login-challenge-segmented-control';

describe('<LoginChallengeSegmentedControl />', () => {
  const renderControl = ({
    onChange = () => {},
    defaultValue,
  }: Partial<LoginChallengeSegmentedControlProps>) =>
    customRender(
      <LoginChallengeSegmentedControl
        defaultValue={defaultValue}
        onChange={onChange}
      />,
    );

  it('should render successfully, with SMS selected by default', () => {
    renderControl({});
    const smsSegment = screen.getByRole('button', { name: 'SMS' });
    expect(smsSegment).toBeInTheDocument();
    expect(smsSegment.getAttribute('data-selected')).toBe('true');

    const biometricSegment = screen.getByRole('button', { name: 'Biometric' });
    expect(biometricSegment).toBeInTheDocument();
    expect(biometricSegment.getAttribute('data-selected')).toBe('false');
  });

  it('should render with a default value provided', () => {
    renderControl({ defaultValue: ChallengeKind.biometric });
    const smsSegment = screen.getByRole('button', { name: 'SMS' });
    expect(smsSegment.getAttribute('data-selected')).toBe('false');

    const biometricSegment = screen.getByRole('button', { name: 'Biometric' });
    expect(biometricSegment.getAttribute('data-selected')).toBe('true');
  });

  it('should call onChange when changing segments', async () => {
    const onChange = jest.fn();
    renderControl({ onChange });

    const smsSegment = screen.getByRole('button', { name: 'SMS' });
    const biometricSegment = screen.getByRole('button', {
      name: 'Biometric',
    });

    await userEvent.click(smsSegment);
    expect(onChange).not.toHaveBeenCalled();
    expect(smsSegment.getAttribute('data-selected')).toBe('true');
    expect(biometricSegment.getAttribute('data-selected')).toBe('false');

    await userEvent.click(biometricSegment);
    expect(onChange).toHaveBeenCalledWith(ChallengeKind.biometric);
    expect(smsSegment.getAttribute('data-selected')).toBe('false');
    expect(biometricSegment.getAttribute('data-selected')).toBe('true');

    await userEvent.click(smsSegment);
    expect(onChange).toHaveBeenCalledWith(ChallengeKind.sms);
    expect(smsSegment.getAttribute('data-selected')).toBe('true');
    expect(biometricSegment.getAttribute('data-selected')).toBe('false');

    await userEvent.click(biometricSegment);
    expect(onChange).toHaveBeenCalledWith(ChallengeKind.biometric);
    expect(smsSegment.getAttribute('data-selected')).toBe('false');
    expect(biometricSegment.getAttribute('data-selected')).toBe('true');
  });
});
