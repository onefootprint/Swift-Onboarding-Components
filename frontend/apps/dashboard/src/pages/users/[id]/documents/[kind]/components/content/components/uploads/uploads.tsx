import { IcoUpload24 } from '@onefootprint/icons';
import { Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import Section from '../section/section';
import Upload from './components/upload';

const Uploads = () => {
  const { t } = useTranslation('entity-documents', { keyPrefix: 'uploads' });

  return (
    <Section title={t('title')} IconComponent={IcoUpload24} id={t('title')}>
      <Stack gap={5} overflow="hidden">
        <Upload
          attempts={1}
          source="desktop"
          srcs={['https://i.imgur.com/PnTiaPt.png']}
          status="success"
          title="Selfie"
          when="03:29 pm"
        />
        <Upload
          attempts={1}
          source="desktop"
          srcs={['https://i.imgur.com/6ECWeRg.png', 'https://i.imgur.com/6ECWeRg.png']}
          status="error"
          title="ID doc"
          when="03:29 pm"
        />
        <Upload
          attempts={1}
          source="desktop"
          srcs={['https://i.imgur.com/fVK6Kbl.png']}
          status="success"
          title="Proof of SSN"
          when="03:29 pm"
        />
        <Upload
          attempts={1}
          source="desktop"
          srcs={['https://i.imgur.com/Pyk0Z2K.png']}
          status="success"
          title="Proof of address"
          when="03:29 pm"
        />
      </Stack>
    </Section>
  );
};

export default Uploads;
