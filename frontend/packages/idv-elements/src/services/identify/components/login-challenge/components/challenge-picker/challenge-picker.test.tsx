import { screen, userEvent } from '@onefootprint/test-utils';
import { ChallengeKind } from '@onefootprint/types';
import React from 'react';

import { renderIdentify } from '../../../../config/tests/render';
import ChallengePicker, { ChallengePickerProps } from './challenge-picker';

describe('<ChallengePicker />', () => {
  const renderControl = ({
    onChange = () => {},
    defaultValue,
  }: Partial<ChallengePickerProps>) =>
    renderIdentify(
      <ChallengePicker defaultValue={defaultValue} onChange={onChange} />,
    );

  it('should render successfully, with passkey selected by default', () => {
    renderControl({});

    const biometricSegment = screen.getByRole('button', { name: 'Passkey' });
    expect(biometricSegment).toBeInTheDocument();
    expect(biometricSegment.getAttribute('data-selected')).toBe('true');

    const smsSegment = screen.getByRole('button', { name: 'SMS' });
    expect(smsSegment).toBeInTheDocument();
    expect(smsSegment.getAttribute('data-selected')).toBe('false');
  });

  it('should render with a default value provided', () => {
    renderControl({ defaultValue: ChallengeKind.biometric });
    const smsSegment = screen.getByRole('button', { name: 'SMS' });
    expect(smsSegment.getAttribute('data-selected')).toBe('false');

    const biometricSegment = screen.getByRole('button', { name: 'Passkey' });
    expect(biometricSegment.getAttribute('data-selected')).toBe('true');
  });

  it('should call onChange when changing segments', async () => {
    const onChange = jest.fn();
    renderControl({ onChange });

    const smsSegment = screen.getByRole('button', { name: 'SMS' });
    const biometricSegment = screen.getByRole('button', {
      name: 'Passkey',
    });

    await userEvent.click(biometricSegment);
    expect(onChange).not.toHaveBeenCalled();
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
