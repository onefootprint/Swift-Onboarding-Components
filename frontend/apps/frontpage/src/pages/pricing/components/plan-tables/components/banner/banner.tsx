import { IcoArrowRightSmall16 } from '@onefootprint/icons';
import { LinkButton, media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type BannerPropsTypes = {
  title: string;
  cta: string;
  handleClickTrigger: () => void;
};
const Banner = ({ title, cta, handleClickTrigger }: BannerPropsTypes) => (
  <BannerContainer>
    <Typography variant="label-2" color="success">
      {title}
    </Typography>

    <LinkButton
      variant="default"
      onClick={handleClickTrigger}
      sx={{ marginLeft: 3 }}
      iconComponent={IcoArrowRightSmall16}
    >
      {cta}
    </LinkButton>
  </BannerContainer>
);

const BannerContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    padding: ${theme.spacing[3]} ${theme.spacing[5]};
    border-bottom: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    background-color: ${theme.backgroundColor.success};
    text-align: center;

    button {
      color: ${theme.color.success};
      svg {
        path {
          fill: ${theme.color.success};
        }
      }

      &:hover {
        color: ${theme.color.success};
        opacity: 0.8;

        svg {
          path {
            fill: ${theme.color.success};
            opacity: 0.8;
          }
        }
      }
    }

    ${media.greaterThan('sm')`
      flex-direction: row;
    `};
  `}
`;

export default Banner;
