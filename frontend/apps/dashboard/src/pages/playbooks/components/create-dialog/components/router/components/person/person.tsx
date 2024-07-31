import { type DataToCollectMeta, PlaybookKind } from '@/playbooks/utils/machine/types';
import { OnboardingTemplate } from '@/playbooks/utils/machine/types';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Panel from '../panel';
import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';

type PersonProps = {
  meta: DataToCollectMeta;
};

const Person = ({ meta }: PersonProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person' });
  const [showForm, setShowForm] = useState(false);
  const isInternationalOnly = meta.residency?.allowInternationalResidents && !meta.residency.allowUsResidents;
  const isFixedPlaybook =
    meta.onboardingTemplate === OnboardingTemplate.Alpaca || meta.onboardingTemplate === OnboardingTemplate.Apex;
  const canEdit = !isInternationalOnly && !isFixedPlaybook;

  const getTitle = () => {
    if (showForm) {
      return meta.kind === PlaybookKind.Kyc ? t('form.title.kyc') : t('form.title.kyb');
    }
    return meta.kind === PlaybookKind.Kyc ? t('preview.title.kyc') : t('preview.title.kyb');
  };

  const handleToggle = () => {
    setShowForm(prev => !prev);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const renderCta = () => {
    if (!canEdit) return null;
    return showForm ? null : <Cta onClick={handleToggle} />;
  };

  return (
    <Panel cta={renderCta()} title={getTitle()}>
      {showForm ? <Form meta={meta} onClose={handleClose} /> : <Preview meta={meta} />}
    </Panel>
  );
};

export default Person;
