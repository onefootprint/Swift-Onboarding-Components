import { useTranslation } from '@onefootprint/hooks';
import { IcoFaceid24, IcoPhone24 } from '@onefootprint/icons';
import { ChallengeKind } from '@onefootprint/types';
import { SegmentedControl } from '@onefootprint/ui';
import React, { useState } from 'react';

export type LoginChallengeSegmentedControlProps = {
  defaultValue?: ChallengeKind;
  onChange: (challengeKind: ChallengeKind) => void;
};

const LoginChallengeSegmentedControl = ({
  defaultValue,
  onChange,
}: LoginChallengeSegmentedControlProps) => {
  const { t } = useTranslation('components.login-challenge-segmented-control');

  const options = [
    { label: t('sms'), value: ChallengeKind.sms, IconComponent: IcoPhone24 },
    {
      label: t('biometric'),
      value: ChallengeKind.biometric,
      IconComponent: IcoFaceid24,
    },
  ];
  const [segment, setSegment] = useState<ChallengeKind>(
    defaultValue ?? ChallengeKind.sms,
  );

  const handleChangeSegment = (value: string) => {
    const newSegment = value as ChallengeKind;
    setSegment(newSegment);
    onChange(newSegment);
  };

  return (
    <SegmentedControl
      aria-label={t('aria-label')}
      value={segment}
      onChange={handleChangeSegment}
      options={options}
    />
  );
};

export default LoginChallengeSegmentedControl;
