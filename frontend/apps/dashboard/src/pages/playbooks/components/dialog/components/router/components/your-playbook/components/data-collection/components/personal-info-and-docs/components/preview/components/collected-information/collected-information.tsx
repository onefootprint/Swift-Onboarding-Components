import { useTranslation } from '@onefootprint/hooks';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

import { PersonalInformationAndDocs } from '@/playbooks/utils/machine/types';

import DisplayValue from './components/display-value';

type CollectedInformationProps = {
  fields: string[];
  title: string;
  personalInfoAndDocs: PersonalInformationAndDocs;
};
const CollectedInformation = ({
  fields,
  title,
  personalInfoAndDocs,
}: CollectedInformationProps) => {
  const { t } = useTranslation(
    'pages.playbooks.dialog.your-playbook.form.personal-info-and-docs',
  );

  return (
    <Container>
      <Typography variant="label-3" color="secondary">
        {title}
      </Typography>
      <ValuesContainer>
        {fields.map(field => (
          <ItemContainer key={field}>
            <Typography
              variant="body-3"
              color="tertiary"
              sx={{ whiteSpace: 'nowrap', textAlign: 'right' }}
            >
              {t(`preview.${field}`)}
            </Typography>
            <ValueContainer>
              <DisplayValue
                field={field as keyof PersonalInformationAndDocs}
                personalInfoAndDocs={personalInfoAndDocs}
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

export default CollectedInformation;
