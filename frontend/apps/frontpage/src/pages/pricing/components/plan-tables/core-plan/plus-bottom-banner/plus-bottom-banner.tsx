import styled, { css } from '@onefootprint/styled';
import { createFontStyles, Typography } from '@onefootprint/ui';
import React from 'react';

type PlusBottomBannerProps = {
  tag: string;
  title: string;
  details: string;
};

const PlusBottomBanner = ({ tag, title, details }: PlusBottomBannerProps) => (
  <Container>
    <StyledTag>{tag}</StyledTag>
    <Typography variant="label-2">{title}</Typography>
    <Typography variant="body-2" color="secondary">
      {details}
    </Typography>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    align-items: flex-start;
    gap: ${theme.spacing[2]};
    margin-top: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
    padding: ${theme.spacing[6]};
  `}
`;

const StyledTag = styled.div`
  ${({ theme }) => css`
    ${createFontStyles('label-3')}
    background-color: ${theme.backgroundColor.quaternary};
    border-radius: ${theme.borderRadius.compact};
    padding: ${theme.spacing[1]} ${theme.spacing[3]};
    margin-bottom: ${theme.spacing[2]};
  `}
`;

export default PlusBottomBanner;
