import { IcoArrowRightSmall24 } from '@onefootprint/icons';
import { LinkButton, media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type TwitterBreadcrumbProps = {
  title: string;
  description: string;
  twitterLabel: string;
};

const TwitterBreadcrumb = ({
  title,
  description,
  twitterLabel,
}: TwitterBreadcrumbProps) => (
  <BreadcrumbContainer>
    <Breadcrumb>
      <BreadcrumbTitleContainer>
        <Typography color="primary" variant="label-2" as="span">
          {title}
        </Typography>
        <Typography color="primary" variant="label-2" as="span">
          {description}
        </Typography>
      </BreadcrumbTitleContainer>
      <LinkButton
        href="https://twitter.com/footprint_hq"
        iconComponent={IcoArrowRightSmall24}
        target="_blank"
      >
        {twitterLabel}
      </LinkButton>
    </Breadcrumb>
  </BreadcrumbContainer>
);

const Breadcrumb = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius[2]}px;
    display: flex;
    justify-content: space-between;
    margin: 0 -${theme.spacing[5]}px 0;
    padding: ${theme.spacing[4]}px ${theme.spacing[5]}px;

    ${media.greaterThan('lg')`
      margin: initial;
    `}

    ${media.lessThan('md')`
      border-radius: 0;
    `}
  `}
`;

const BreadcrumbTitleContainer = styled.div`
  span:last-child {
    display: none;
  }

  ${media.greaterThan('lg')`
    span:last-child {
      display: inline;
    }
  `}
`;

const BreadcrumbContainer = styled.div`
  ${({ theme }) => css`
    margin-bottom: ${theme.spacing[9]}px;
  `}
`;

export default TwitterBreadcrumb;
