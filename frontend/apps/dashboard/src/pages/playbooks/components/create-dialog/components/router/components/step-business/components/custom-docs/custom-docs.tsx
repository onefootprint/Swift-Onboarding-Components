import { useState } from 'react';

import { useTranslation } from 'react-i18next';
import Panel from '../../../panel';
import Cta from './components/cta/cta';
import Form from './components/form';
import Preview from './components/preview';
import useCustomDocsValues from './hooks/use-custom-docs-values';

const AdditionalDocs = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business.custom-docs' });
  const [showContent, setShowContent] = useState(false);
  const {
    meta: { hasDoc },
  } = useCustomDocsValues();

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
