import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import Panel from '../panel';
import Cta from './components/cta/cta';
import Form from './components/form';
import Preview from './components/preview';
import useAdditionalDocs from './hooks/use-additional-docs';

const AdditionalDocs = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.additional-docs',
  });
  const [showContent, setShowContent] = useState(false);
  const {
    meta: { hasDoc },
  } = useAdditionalDocs();

  const handleToggle = () => {
    setShowContent(prev => !prev);
  };

  const handleClose = () => {
    setShowContent(false);
  };

  return (
    <Panel cta={showContent ? null : <Cta onClick={handleToggle} hasAdded={hasDoc} />} title={t('title')}>
      {showContent ? <Form onClose={handleClose} /> : <Preview />}
    </Panel>
  );
};

export default AdditionalDocs;
