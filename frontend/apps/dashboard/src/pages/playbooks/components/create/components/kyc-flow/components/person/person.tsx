import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Panel from '../../../panel';
import type { ResidencyFormData } from '../../../step-residency';
import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';

type PersonProps = {
  meta: {
    canEdit: boolean;
    residencyForm: ResidencyFormData;
  };
};

const Person = ({ meta }: PersonProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.person' });
  const [showForm, setShowForm] = useState(false);

  const handleToggle = () => {
    setShowForm(prev => !prev);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  const renderCta = () => {
    if (!meta.canEdit) return null;
    return showForm ? null : <Cta onClick={handleToggle} />;
  };

  return (
    <Panel cta={renderCta()} title={showForm ? t('form.title.kyc') : t('preview.title.kyc')}>
      {showForm ? <Form onClose={handleClose} /> : <Preview meta={meta} />}
    </Panel>
  );
};

export default Person;
