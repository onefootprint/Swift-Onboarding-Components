import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { SupportedIdDocTypes } from '@onefootprint/types';
import { Tag, Typography } from '@onefootprint/ui';
import kebabCase from 'lodash/kebabCase';
import React from 'react';

export type SectionProps = {
  displayScopes: string[];
  canAccessData: string[];
  title: string;
};

const Section = ({ canAccessData, title, displayScopes }: SectionProps) => {
  const { t } = useTranslation('pages.playbooks.collected-data');

  const dataToDisplay = canAccessData.filter(
    scope =>
      // we will handle document separately
      displayScopes.includes(scope) && !scope.includes('document'),
  );

  const documentString = canAccessData.filter(scopes =>
    scopes.includes('document'),
  )?.[0];
  const idDocKinds = Object.values(SupportedIdDocTypes).filter(v =>
    documentString?.includes(v),
  );
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
      <Typography variant="label-3" color="secondary">
        {title}
      </Typography>
      <TagContainer>
        {dataToDisplay.map(field => (
          <Tag key={field}>{t(kebabCase(field))}</Tag>
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
