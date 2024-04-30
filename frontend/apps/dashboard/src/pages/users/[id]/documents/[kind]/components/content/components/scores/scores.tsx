import { IcoLock16, IcoSpeedometer24 } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

import Section from '../section/section';

export type ScoresProps = {
  document: number | null;
  data: number | null;
  face: number | null;
  isEncrypted?: boolean;
};

const Scores = ({ document, data, face, isEncrypted }: ScoresProps) => {
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
              {document || '--'}
            </Text>
          </Text>
        </Item>
        <Item aria-label={t('extracted')} aria-hidden>
          <Text color="tertiary" variant="body-4">
            {t('extracted')}
          </Text>
          <Text color="success" variant="heading-1">
            {data || '--'}/
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
            {face || '--'}/
            <Text variant="heading-3" tag="span">
              100
            </Text>
          </Text>
        </Item>
      </Container>
      {isEncrypted && (
        <EncryptedContainer>
          <LockIcon />
          <Text variant="label-4">{t('encrypted')}</Text>
        </EncryptedContainer>
      )}
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

const EncryptedContainer = styled.div`
  ${({ theme }) => css`
    align-items: center;
    backdrop-filter: blur(${theme.spacing[3]});
    background: rgba(255, 255, 255, 0.1);
    border-radius: ${theme.borderRadius.default};
    display: flex;
    gap: ${theme.spacing[2]};
    height: calc(100% - 2px);
    justify-content: center;
    left: ${theme.borderWidth[1]};
    position: absolute;
    top: ${theme.borderWidth[1]};
    width: calc(100% - 2px);
  `};
`;

const LockIcon = styled(IcoLock16)`
  position: relative;
  top: -1px;
`;

export default Scores;
