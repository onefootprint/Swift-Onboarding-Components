import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import AdditionalDocsForm from '../additional-docs-form';
import useAdditionalDocs from './hooks/use-additional-docs';

import Panel from '../panel';
import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';

const AdditionalDocsWithPanel = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.data-to-collect.additional-docs',
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
      {showContent ? (
        <Form onClose={handleClose}>
          <AdditionalDocsForm />
        </Form>
      ) : (
        <Preview />
      )}
    </Panel>
  );
};

export default AdditionalDocsWithPanel;
