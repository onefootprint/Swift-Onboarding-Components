import { IcoSpeedometer24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Section from '../section';

export type ScoresProps = {
  document: number | null;
  ocr: number | null;
  selfie: number | null;
};

const Scores = ({ document, ocr, selfie }: ScoresProps) => {
  const { t } = useTranslation('entity-documents', { keyPrefix: 'scores' });

  return (
    <Section title="Scores" IconComponent={IcoSpeedometer24} id="scores">
      <Container>
        <Item aria-label={t('document')} aria-hidden>
          <Text color="tertiary" variant="body-3">
            {t('document')}
          </Text>
          <Text color="success" variant="heading-1">
            {document}/
            <Text variant="heading-3" tag="span">
              {document || '--'}
            </Text>
          </Text>
        </Item>
        <Item aria-label={t('ocr')} aria-hidden>
          <Text color="tertiary" variant="body-3">
            {t('ocr')}
          </Text>
          <Text color="success" variant="heading-1">
            {ocr || '--'}/
            <Text variant="heading-3" tag="span">
              100
            </Text>
          </Text>
        </Item>
        <Item aria-label={t('selfie')} aria-hidden>
          <Text color="tertiary" variant="body-3">
            {t('selfie')}
          </Text>
          <Text color="success" variant="heading-1">
            {selfie || '--'}/
            <Text variant="heading-3" tag="span">
              100
            </Text>
          </Text>
        </Item>
      </Container>
    </Section>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    align-items: flex-start;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    gap: ${theme.spacing[5]};
    padding: ${theme.spacing[5]} ${theme.spacing[6]};
  `};
`;

const Item = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: ${theme.spacing[2]};

    &:not(:first-child) {
      border-left: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      padding-left: ${theme.spacing[6]};
    }
  `};
`;

export default Scores;
