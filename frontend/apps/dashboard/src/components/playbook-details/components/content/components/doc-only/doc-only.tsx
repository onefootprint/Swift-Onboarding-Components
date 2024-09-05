import type { OnboardingConfig } from '@onefootprint/types';
import { Divider, Stack, Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import AdditionalDocs from '../additional-docs';
import DocTypesAndCountries from './components/doc-types-and-countries';

type DocOnlyProps = { playbook: OnboardingConfig };

const DocOnly = ({
  playbook: { documentTypesAndCountries, documentsToCollect = [], mustCollectData = [] },
}: DocOnlyProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'details.data-collection' });
  const hasSelfie = mustCollectData.includes('document_and_selfie');

  return (
    <Container>
      <Stack gap={7} direction="column">
        <Stack gap={4} direction="column">
          <Text variant="label-2">{t('section-title')}</Text>
          <Divider />
        </Stack>
        {documentTypesAndCountries && (
          <DocTypesAndCountries documentTypesAndCountries={documentTypesAndCountries} hasSelfie={hasSelfie} />
        )}
        {documentsToCollect && documentsToCollect.length > 0 && (
          <AdditionalDocs variant="sectioned" docs={documentsToCollect} />
        )}
      </Stack>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[8]};
  `}
`;

export default DocOnly;
