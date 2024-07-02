import React, { useState } from 'react';

import { useTranslation } from 'react-i18next';
import useDocs from '../../../../../../../../hooks/use-docs';

import Panel from '../panel';
import Cta from './components/cta';
import DocForm from './components/doc-form';
import DocPreview from './components/doc-preview';

const GovDocsWithPanel = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.data-to-collect.docs' });
  const [showContent, setShowContent] = useState(false);
  const {
    meta: { hasDoc },
  } = useDocs();

  const handleToggle = () => {
    setShowContent(prev => !prev);
  };

  const handleClose = () => {
    setShowContent(false);
  };

  return (
    <Panel cta={showContent ? null : <Cta onClick={handleToggle} hasAdded={hasDoc} />} title={t('title')}>
      {showContent ? <DocForm onClose={handleClose} /> : <DocPreview />}
    </Panel>
  );
};

export default GovDocsWithPanel;
