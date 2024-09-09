import { Divider, Text } from '@onefootprint/ui';
import type React from 'react';
import styled, { css } from 'styled-components';

type SectionProps = {
  title: string;
  children: React.ReactNode;
  id?: string;
  suffixActions?: React.ReactNode;
};

const Section = ({ children, title, id, suffixActions }: SectionProps) => (
  <section aria-label={title} id={id} data-testid={id}>
    <Header>
      <Text tag="h2" variant="heading-5">
        {title}
      </Text>
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
    margin-bottom: ${theme.spacing[5]};
  `}
`;

export default Section;
