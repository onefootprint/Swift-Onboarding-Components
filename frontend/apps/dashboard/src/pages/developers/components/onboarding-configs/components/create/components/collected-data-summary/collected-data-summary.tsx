import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import React from 'react';
import CdoTagList from 'src/components/cdo-tag-list';

type CollectedDataSummaryProps = {
  collectedData: string[];
};

const CollectedDataSummary = ({ collectedData }: CollectedDataSummaryProps) => {
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.create.collected-data-summary',
  );

  return (
    <Container>
      <CdoTagList
        label={t('will-collect')}
        testID="collected-data"
        cdos={collectedData}
        disableSort
      />
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    position: sticky;
    top: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: ${theme.backgroundColor.secondary};
    width: calc(100% + 2 * ${theme.spacing[7]});
    margin: calc(-1 * ${theme.spacing[7]}) calc(-1 * ${theme.spacing[7]}) 0
      calc(-1 * ${theme.spacing[7]});
    padding: ${theme.spacing[3]} ${theme.spacing[7]};
    border-bottom: 1px solid ${theme.borderColor.tertiary};
  `}
`;

export default CollectedDataSummary;
