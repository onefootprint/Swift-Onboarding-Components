import { LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type BannerPropsTypes = {
  title: string;
  cta: string;
  handleClickTrigger: () => void;
};
const Banner = ({ title, cta, handleClickTrigger }: BannerPropsTypes) => (
  <BannerContainer>
    <Typography variant="label-2" color="secondary">
      {title}
      <LinkButton
        variant="default"
        onClick={handleClickTrigger}
        sx={{ marginLeft: 3 }}
      >
        {cta}
      </LinkButton>
    </Typography>
  </BannerContainer>
);

const BannerContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.success};
    text-align: center;
  `}
`;

export default Banner;
