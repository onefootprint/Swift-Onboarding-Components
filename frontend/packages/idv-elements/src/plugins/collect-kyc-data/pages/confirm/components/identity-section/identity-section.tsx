import { useTranslation } from '@onefootprint/hooks';
import { IcoUserCircle24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import React, { useState } from 'react';

import {
  type SectionItemProps,
  Section,
  SectionItem,
} from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import { getDisplayValue } from '../../../../utils/data-types';
import Ssn from '../../../ssn';

const IdentitySection = () => {
  const { t, allT } = useTranslation('pages.confirm');
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const [editing, setEditing] = useState(false);

  const identity = [];
  const ssn9 = getDisplayValue(data[IdDI.ssn9]);
  const ssn4 = getDisplayValue(data[IdDI.ssn4]);
  if (ssn9) {
    identity.push({
      text: t('identity.ssn9'),
      subtext: ssn9,
    });
  } else if (ssn4) {
    identity.push({
      text: t('identity.ssn4'),
      subtext: ssn4,
    });
  }
  if (!identity.length) {
    return null;
  }

  const startEditing = () => {
    setEditing(true);
  };

  const stopEditing = () => {
    setEditing(false);
  };

  const identityItems = identity.map(
    ({ text, subtext, textColor }: SectionItemProps) => (
      <SectionItem
        key={text}
        text={text}
        subtext={subtext}
        textColor={textColor}
      />
    ),
  );

  const getSectionContent = () => {
    if (!editing) {
      return identityItems;
    }
    return (
      <Ssn
        onCancel={stopEditing}
        onComplete={stopEditing}
        hideHeader
        hideDisclaimer
      />
    );
  };

  return (
    <Section
      title={t('identity.title')}
      editLabel={allT('pages.confirm.summary.edit')}
      onEdit={editing ? undefined : startEditing}
      IconComponent={IcoUserCircle24}
      content={getSectionContent()}
      testID="identity-section"
    />
  );
};

export default IdentitySection;
