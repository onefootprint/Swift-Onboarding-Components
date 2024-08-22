import { IcoCheck24, IcoClose24 } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import styled, { css } from 'styled-components';
import { CustomDocsPreview } from '../../../custom-docs';
import useAdditionalDocs from '../../hooks/use-additional-docs';

const Preview = () => {
  const { t } = useTranslation('playbooks', {
    keyPrefix: 'create.additional-docs',
  });
  const {
    custom,
    requireManualReview,
    meta: { hasDoc, hasPoA, hasPoSsn, hasCustom },
  } = useAdditionalDocs();

  if (!hasDoc) {
    return (
      <Text variant="body-3" color="tertiary">
        {t('description')}
      </Text>
    );
  }

  return (
    <Stack gap={7} flexDirection="column">
      <Stack flexDirection="column" gap={5}>
        <Stack justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('form.poa.label')}
          </Text>
          {hasPoA ? <IcoCheck24 /> : <IcoClose24 />}
        </Stack>
        <Stack justifyContent="space-between">
          <Text variant="body-3" color="tertiary">
            {t('form.possn.label')}
          </Text>
          {hasPoSsn ? <IcoCheck24 /> : <IcoClose24 />}
        </Stack>
      </Stack>
      {hasCustom ? (
        <Stack flexDirection="column" gap={5}>
          <Text variant="label-3">{t('form.custom.label')}</Text>
          {custom.map(({ name, uploadSettings, identifier }) => (
            <CustomDocsContainer key={identifier}>
              <CustomDocsPreview identifier={identifier} uploadSettings={uploadSettings} name={name} />
            </CustomDocsContainer>
          ))}
        </Stack>
      ) : null}
      {hasDoc ? (
        <Stack justifyContent="space-between" flexDirection="column" gap={5}>
          <Text variant="label-3">{t('extra-requirements')}</Text>
          <Stack justifyContent="space-between">
            <Text variant="body-3" color="tertiary">
              {t('form.require-manual-review.label')}
            </Text>
            {requireManualReview ? <IcoCheck24 /> : <IcoClose24 />}
          </Stack>
        </Stack>
      ) : null}
    </Stack>
  );
};

const CustomDocsContainer = styled.div`
  ${({ theme }) => css`
    border-bottom: 1px dashed ${theme.borderColor.tertiary};
    padding-bottom: ${theme.spacing[5]};
    &:last-of-type {
      border-bottom: none;
      padding-bottom: 0
    }
  `}
`;

export default Preview;
