import { IcoUserCircle24 } from '@onefootprint/icons';
import type { CollectKycDataRequirement } from '@onefootprint/types';
import React, { useEffect, useState } from 'react';

import type { SectionAction, SectionItemProps } from '@/components/confirm-collected-data';
import { Section, SectionItem } from '@/components/confirm-collected-data';
import useTranslation from '@/hooks/use-translation';
import Ssn from '@/screens/ssn';
import { getSsnKind, getSsnValue, ssnFormatter } from '@/screens/ssn/utils/ssn-utils';
import type { KycData } from '@/types';
import isCountryUsOrTerritories from '@/utils/is-country-us-or-territories';

export enum SsnValue {
  skipped,
  hidden,
  revealed,
}

type IdentitySectionProps = {
  authToken: string;
  requirement: CollectKycDataRequirement;
  data: KycData;
  onConfirm: (data: KycData) => void;
};

// TODO: Handle step-up case
// TODO: Handle userFound case
const IdentitySection = ({ authToken, data, onConfirm, requirement }: IdentitySectionProps) => {
  const { t, allT } = useTranslation('pages.confirm');
  const ssnKind = getSsnKind(requirement);
  const ssn = getSsnValue(data, ssnKind);
  const isUsOrTerritories = isCountryUsOrTerritories(data);
  const [editing, setEditing] = useState(false);

  const getSsnValueType = () => {
    if (ssn?.value) {
      return SsnValue.hidden;
    }
    return ssn?.scrubbed ? SsnValue.hidden : SsnValue.skipped;
  };
  const [ssnValueType, setSsnValueType] = useState(getSsnValueType());

  useEffect(() => {
    if (ssn?.decrypted) {
      // If newly decrypted, want to reveal immediately
      setSsnValueType(SsnValue.revealed);
    } else {
      setSsnValueType(getSsnValueType());
    }
  }, [ssn]);

  const identity: SectionItemProps[] = [];
  if (ssnKind) {
    let ssnDisplayVal: string | undefined;
    if (ssnValueType === SsnValue.skipped) {
      ssnDisplayVal = t('identity.ssn-skipped-subtext');
    } else {
      ssnDisplayVal = ssnFormatter(ssnKind, ssn?.value, ssnValueType === SsnValue.hidden);
    }
    identity.push({
      text: ssnKind === 'ssn-full' ? t('identity.ssn9') : t('identity.ssn4'),
      subtext: ssnDisplayVal,
    });
  }

  const handleComplete = (kycData: KycData) => {
    onConfirm(kycData);
    setEditing(false);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  const getSectionContent = () => {
    if (!editing) {
      const identityItems = identity.map(({ text, subtext, textColor }: SectionItemProps) => (
        <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
      ));
      return identityItems;
    }
    return (
      <Ssn
        requirement={requirement}
        authToken={authToken}
        kycData={data}
        onCancel={stopEditing}
        onComplete={handleComplete}
        hideHeader
      />
    );
  };

  const handleReveal = () => {
    if (ssn?.value) {
      setSsnValueType(SsnValue.revealed);
    }
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: allT('pages.confirm.summary.edit'),
      onClick: () => setEditing(true),
      actionTestID: 'identity-edit-button',
    });

    const canReveal = ssn?.value;
    if (canReveal) {
      if (ssnValueType === SsnValue.revealed) {
        actions.unshift({
          label: allT('pages.confirm.summary.hide'),
          onClick: () => setSsnValueType(SsnValue.hidden),
          actionTestID: 'identity-hide-button',
        });
      } else {
        // TODO: Add support for step-up
        actions.unshift({
          label: allT('pages.confirm.summary.reveal'),
          onClick: handleReveal,
          actionTestID: 'identity-reveal-button',
        });
      }
    }
  }

  if (!isUsOrTerritories || !identity.length) {
    return null;
  }

  return (
    <Section
      title={t('identity.title')}
      actions={actions}
      IconComponent={IcoUserCircle24}
      content={getSectionContent()}
      testID="identity-section"
    />
  );
};

export default IdentitySection;
