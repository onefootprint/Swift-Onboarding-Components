import styled, { css } from '@onefootprint/styled';
import { Divider, Typography } from '@onefootprint/ui';
import React from 'react';

type SectionProps = {
  title: string;
  children: React.ReactNode;
  id?: string;
  suffixActions?: React.ReactNode;
};

const Section = ({ children, title, id, suffixActions }: SectionProps) => (
  <section aria-label={title} id={id} data-testid={id}>
    <Header>
      <Typography as="h2" variant="label-1">
        {title}
      </Typography>
      {suffixActions}
    </Header>
    <StyledDivider />
    {children}
  </section>
);

const Header = styled.header`
  ${({ theme }) => css`
    display: flex;
    align-items: flex-end;
    flex-direction: column wrap;
    justify-content: space-between;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

const StyledDivider = styled(Divider)`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[7]};
  `}
`;

export default Section;
