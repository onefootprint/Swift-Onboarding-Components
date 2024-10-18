import { Checkbox, Stack, Text } from '@onefootprint/ui';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container/animated-container';

import { RequestMoreInfoKind } from '../../types';
import CustomDocumentOption from './components/custom-document-option';

const RequestDocument = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'actions.request-more-info.form.document',
  });
  const { register, watch } = useFormContext();
  const triggerKinds = watch('kinds');

  return (
    <Stack direction="column" gap={5}>
      <Text variant="label-3">{t('title')}</Text>
      <Stack direction="column" gap={4}>
        <Checkbox label={t('id-photo.title')} value={RequestMoreInfoKind.IdDocument} {...register('kinds')} />
        <AnimatedContainer isExpanded={triggerKinds.includes(RequestMoreInfoKind.IdDocument)} marginLeft={7}>
          <Checkbox
            label={t('id-photo.collect-selfie')}
            checked={watch('collectSelfie')}
            {...register('collectSelfie')}
          />
        </AnimatedContainer>
        <Checkbox label={t('proof-of-ssn.title')} value={RequestMoreInfoKind.ProofOfSsn} {...register('kinds')} />
        <Checkbox
          label={t('proof-of-address.title')}
          value={RequestMoreInfoKind.ProofOfAddress}
          {...register('kinds')}
        />
        <CustomDocumentOption />
      </Stack>
    </Stack>
  );
};

export default RequestDocument;
