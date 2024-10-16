import { Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import CustomDocsPreview from '../../../../../../collect-custom-docs-preview';
import useMeta from '../hooks/use-meta';

const Preview = () => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'create.business.custom-docs' });
  const { custom, hasDoc } = useMeta();

  if (!hasDoc) {
    return (
      <Text variant="body-3" color="tertiary">
        {t('description')}
      </Text>
    );
  }

  return (
    <Stack flexDirection="column" gap={5}>
      <Text variant="label-3">{t('form.custom.label')}</Text>
      {custom.map(({ name, uploadSettings, identifier }) => (
        <CustomDocsContainer key={identifier}>
          <CustomDocsPreview identifier={identifier} uploadSettings={uploadSettings} name={name} />
        </CustomDocsContainer>
      ))}
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
