import { IcoSpeedometer24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Section from '../section/section';

export type ScoresProps = {
  document: number;
  data: number;
  face: number;
};

const Scores = ({ document, data, face }: ScoresProps) => {
  const { t } = useTranslation('entity-documents', { keyPrefix: 'scores' });

  return (
    <Section title="Scores" IconComponent={IcoSpeedometer24} id="scores">
      <Container>
        <Item aria-label={t('document')} aria-hidden>
          <Text color="tertiary" variant="body-4">
            {t('document')}
          </Text>
          <Text color="success" variant="heading-1">
            {document}/
            <Text variant="heading-3" tag="span">
              100
            </Text>
          </Text>
        </Item>
        <Item aria-label={t('extracted')} aria-hidden>
          <Text color="tertiary" variant="body-4">
            {t('extracted')}
          </Text>
          <Text color="success" variant="heading-1">
            {data}/
            <Text variant="heading-3" tag="span">
              100
            </Text>
          </Text>
        </Item>
        <Item aria-label={t('face')} aria-hidden>
          <Text color="tertiary" variant="body-4">
            {t('face')}
          </Text>
          <Text color="success" variant="heading-1">
            {face}/
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
    flex: 1;
    display: flex;
    gap: ${theme.spacing[2]};
    flex-direction: column;

    &:not(:first-child) {
      border-left: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
      padding-left: ${theme.spacing[6]};
    }
  `};
`;

export default Scores;
