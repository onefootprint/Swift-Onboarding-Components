import { IcoGlobe24 } from '@onefootprint/icons';
import { IdDI } from '@onefootprint/types';
import type { CountrySelectOption } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { SectionAction, SectionItemProps } from '../../../../../../components/confirm-collected-data';
import { Section, SectionItem } from '../../../../../../components/confirm-collected-data';
import useCollectKycDataMachine from '../../../../hooks/use-collect-kyc-data-machine';
import isCountryUsOrTerritories from '../../../../utils/state-machine/utils/is-country-us-or-territories';
import LegalStatus from '../../../legal-status';
import getCountrySelectOption from '../../../legal-status/utils/get-country-select-option';

const LegalStatusSection = () => {
  const { t } = useTranslation('idv', { keyPrefix: 'kyc.pages' });
  const [state] = useCollectKycDataMachine();
  const { data } = state.context;
  const [editing, setEditing] = useState(false);
  const isUsOrTerritories = isCountryUsOrTerritories(data);

  const legalStatus = [];

  const status = data[IdDI.usLegalStatus]?.value;
  // we check status so we don't show this section for old onboarding configs that include the nationality field but not legal status
  if (!isUsOrTerritories || !status) {
    return null;
  }

  if (status) {
    legalStatus.push({
      text: t('confirm.legal-status.text.status'),
      subtext: t(`confirm.legal-status.statuses.${status}`),
    });
  }

  const nationalityVal = data[IdDI.nationality]?.value;
  const nationality = getCountrySelectOption(nationalityVal)?.label;
  if (nationality) {
    legalStatus.push({
      text: t('confirm.legal-status.text.nationality'),
      subtext: nationality,
    });
  }

  const citizenshipsVal = data[IdDI.citizenships]?.value;
  if (citizenshipsVal) {
    const citizenships = citizenshipsVal
      .map(maybeCountryCode => getCountrySelectOption(maybeCountryCode))
      .filter((option): option is CountrySelectOption => !!option);

    if (citizenships) {
      const formattedCitizenships = citizenships.map(({ label }: { label: string }) => label).join(', ');
      legalStatus.push({
        text: t('confirm.legal-status.text.citizenship'),
        subtext: formattedCitizenships,
      });
    }
  }

  const visaKindVal = data[IdDI.visaKind]?.value;
  if (visaKindVal) {
    legalStatus.push({
      text: t('confirm.legal-status.text.visa-kind'),
      subtext: t(`legal-status.form.visa-kind.mapping.${visaKindVal}`),
    });
  }

  const visaExpirationVal = data[IdDI.visaExpirationDate]?.value;
  if (visaExpirationVal) {
    legalStatus.push({
      text: t('confirm.legal-status.text.visa-expiration'),
      subtext: visaExpirationVal,
    });
  }

  const stopEditing = () => {
    setEditing(false);
  };

  const legalStatusItem = legalStatus.map(({ text, subtext, textColor }: SectionItemProps) => (
    <SectionItem key={text} text={text} subtext={subtext} textColor={textColor} />
  ));

  const getSectionContent = () => {
    if (!editing) {
      return legalStatusItem;
    }
    return <LegalStatus onComplete={stopEditing} onCancel={stopEditing} hideHeader />;
  };

  const actions: SectionAction[] = [];
  if (!editing) {
    actions.push({
      label: t('confirm.summary.edit'),
      onClick: () => setEditing(true),
    });
  }

  return (
    <Section
      title={t('confirm.legal-status.text.title')}
      actions={actions}
      IconComponent={IcoGlobe24}
      content={getSectionContent()}
      testID="legal-status-section"
    />
  );
};

export default LegalStatusSection;
