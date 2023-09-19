import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { CollectedKycDataOption } from '@onefootprint/types';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import DisplayValue from './components/display-value';

export type DataCollectionProps = {
  displayFields: string[];
  mustCollectData: string[];
  optionalData?: string[];
  title: string;
};

const DataCollection = ({
  displayFields,
  mustCollectData,
  optionalData = [],
  title,
}: DataCollectionProps) => {
  const { t } = useTranslation(
    'pages.playbooks.details.content.data-collection',
  );

  const getLabel = (field: string) => {
    if (field.includes('document')) {
      return t('document');
    }
    if (field.includes('ssn')) {
      return t('ssn');
    }
    return t(field);
  };

  // We should only show nationality field for backwards compatibility if the obc collects it
  // If it's not collected, we should not show include it in the list
  const hasNationality = mustCollectData.includes(
    CollectedKycDataOption.nationality,
  );
  const filteredDisplayFields = !hasNationality
    ? displayFields.filter(field => field !== 'nationality')
    : displayFields;

  return (
    <Container>
      <Typography variant="label-3" color="secondary">
        {title}
      </Typography>
      <ValuesContainer>
        {filteredDisplayFields.map(field => (
          <ItemContainer key={field}>
            <Typography
              variant="body-3"
              color="tertiary"
              sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}
            >
              {getLabel(field)}
            </Typography>
            <ValueContainer>
              <DisplayValue
                field={field}
                mustCollectData={mustCollectData}
                optionalData={optionalData}
              />
            </ValueContainer>
          </ItemContainer>
        ))}
      </ValuesContainer>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
  `}
`;

const ValueContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  white-space: pre-wrap;
`;

const ItemContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: row;
    width: 100%;
    justify-content: space-between;
    gap: ${theme.spacing[10]};
    height: ${theme.spacing[7]};
  `}
`;

const ValuesContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

export default DataCollection;
