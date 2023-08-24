import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import DisplayValue from './components/display-value';

export type DataCollectionProps = {
  fields: string[];
  title: string;
};

const DataCollection = ({ fields, title }: DataCollectionProps) => {
  const { t } = useTranslation(
    'pages.playbooks.table.details.content.data-collection',
  );

  const getLabel = (field: string) => {
    if (field.includes('document')) {
      return t('document');
    }
    return t(field);
  };

  return (
    <Container>
      <Typography variant="label-3">{title}</Typography>
      <ValuesContainer>
        {fields.map(field => (
          <ItemContainer key={field}>
            <Typography
              variant="body-3"
              color="tertiary"
              sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}
            >
              {getLabel(field)}
            </Typography>
            <ValueContainer>
              <DisplayValue field={field} attributes={fields} />
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
