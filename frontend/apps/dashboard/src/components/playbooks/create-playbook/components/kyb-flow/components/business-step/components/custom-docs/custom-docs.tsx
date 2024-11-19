import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Panel from '../../../../../panel';
import Cta from './components/cta';
import Form from './components/form';
import Preview from './components/preview';
import useMeta from './hooks/use-meta';

const CustomDocs = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business.custom-docs' });
  const [showContent, setShowContent] = useState(false);
  const { hasDoc } = useMeta();

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

export default CustomDocs;
