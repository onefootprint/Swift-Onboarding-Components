import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import useDocs from './hooks/use-meta';

import Panel from '../panel';
import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';

const Govdocs = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.gov-docs' });
  const [showForm, setShowForm] = useState(false);
  const {
    meta: { hasDoc },
  } = useDocs();

  const handleToggle = () => {
    setShowForm(prev => !prev);
  };

  const handleClose = () => {
    setShowForm(false);
  };

  return (
    <Panel cta={showForm ? null : <Cta onClick={handleToggle} hasAdded={hasDoc} />} title={t('title')}>
      {showForm ? <Form onClose={handleClose} /> : <Preview />}
    </Panel>
  );
};

export default Govdocs;
