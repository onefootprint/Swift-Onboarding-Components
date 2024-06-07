import { SupportedIdDocTypes } from '@onefootprint/types';
import { Tag, Text } from '@onefootprint/ui';
import type { ParseKeys } from 'i18next';
import kebabCase from 'lodash/kebabCase';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';

export type SectionProps = {
  displayScopes: string[];
  canAccessData: string[];
  title: string;
  docScanForOptionalSsn?: string;
};

const Section = ({ canAccessData, title, displayScopes, docScanForOptionalSsn }: SectionProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.playbooks.collected-data',
  });

  const dataToDisplay = canAccessData.filter(
    scope =>
      // we will handle document separately
      displayScopes.includes(scope) && !scope.includes('document'),
  );

  const documentString = docScanForOptionalSsn || canAccessData.filter(scopes => scopes.includes('document'))?.[0];
  const idDocKinds = Object.values(SupportedIdDocTypes).filter(v => documentString?.includes(v));
  if (displayScopes.includes('document')) {
    dataToDisplay.push(...idDocKinds);
  }
  if (displayScopes.includes('selfie')) {
    if (documentString?.includes('require_selfie')) {
      dataToDisplay.push('selfie');
    }
  }

  return (
    <Container>
      <Text variant="label-3" color="secondary">
        {title}
      </Text>
      <TagContainer>
        {dataToDisplay.map(field => (
          <Tag key={field}>{t(kebabCase(field) as ParseKeys<'common'>)}</Tag>
        ))}
      </TagContainer>
    </Container>
  );
};

const TagContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-wrap: wrap;
    gap: ${theme.spacing[2]};
  `}
`;

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

export default Section;
