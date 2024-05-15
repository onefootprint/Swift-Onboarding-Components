import { Checkbox, Stack, Text } from '@onefootprint/ui';
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import AnimatedContainer from 'src/components/animated-container/animated-container';

import { RequestMoreInfoKind } from '../../types';
import CustomDocumentOption from './components/custom-document-option';

type RequestDocumentProps = {
  visible: boolean;
};

const RequestDocument = ({ visible }: RequestDocumentProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.request-more-info.form.document',
  });
  const { register, watch } = useFormContext();
  const triggerKinds = watch('kinds');

  return (
    <AnimatedContainer isExpanded={visible}>
      <Stack direction="column" gap={5}>
        <Text variant="label-4">{t('title')}</Text>
        <Stack direction="column" gap={4}>
          <Checkbox
            label={t('id-photo.title')}
            value={RequestMoreInfoKind.IdDocument}
            {...register('kinds')}
          />
          <AnimatedContainer
            isExpanded={triggerKinds.includes(RequestMoreInfoKind.IdDocument)}
            marginLeft={7}
          >
            <Checkbox
              label={t('id-photo.collect-selfie')}
              checked={watch('collectSelfie')}
              {...register('collectSelfie')}
            />
          </AnimatedContainer>
          <Stack direction="column" gap={4}>
            <Checkbox
              label={t('proof-of-ssn.title')}
              value={RequestMoreInfoKind.ProofOfSsn}
              {...register('kinds')}
            />
            <AnimatedContainer
              isExpanded={triggerKinds.includes(RequestMoreInfoKind.ProofOfSsn)}
              marginLeft={7}
            >
              <Text variant="body-4" color="tertiary">
                {t('proof-of-ssn.alert-message')}
              </Text>
            </AnimatedContainer>
          </Stack>
          <Checkbox
            label={t('proof-of-address.title')}
            value={RequestMoreInfoKind.ProofOfAddress}
            {...register('kinds')}
          />
          <CustomDocumentOption />
        </Stack>
      </Stack>
    </AnimatedContainer>
  );
};

export default RequestDocument;
