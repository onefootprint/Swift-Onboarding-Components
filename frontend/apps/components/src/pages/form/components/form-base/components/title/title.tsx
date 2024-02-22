import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type TitleProps = {
  label: string;
  iconComponent?: React.ReactNode;
};

const Title = ({ label, iconComponent }: TitleProps) => (
  <Container>
    {iconComponent}
    <Typography variant="label-3">{label}</Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.spacing[2]};
    margin-bottom: ${theme.spacing[4]};
  `}
`;

export default Title;
