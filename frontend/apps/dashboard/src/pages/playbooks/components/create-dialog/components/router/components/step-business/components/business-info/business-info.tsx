import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Panel from '../../../panel';
import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';

const BusinessInfo = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.business.business-info',
  });
  const [showForm, setShowForm] = useState(false);

  const handleToggle = () => {
    setShowForm(prev => !prev);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <Panel
      cta={showForm ? null : <Cta onClick={handleToggle} />}
      title={showForm ? t('form.title') : t('preview.title')}
    >
      {showForm ? <Form onClose={handleClose} /> : <Preview />}
    </Panel>
  );
};

export default BusinessInfo;
