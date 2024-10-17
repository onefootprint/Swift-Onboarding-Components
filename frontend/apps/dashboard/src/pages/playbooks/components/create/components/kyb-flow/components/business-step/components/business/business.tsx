import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';

import Panel from '../../../../../panel';

const Business = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business.data' });
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

export default Business;
