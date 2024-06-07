import { IcoArrowRightSmall24 } from '@onefootprint/icons';
import { LinkButton, Text, media } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type TwitterBreadcrumbProps = {
  title: string;
  description: string;
  twitterLabel: string;
};

const TwitterBreadcrumb = ({ title, description, twitterLabel }: TwitterBreadcrumbProps) => (
  <BreadcrumbContainer>
    <Breadcrumb>
      <BreadcrumbTitleContainer>
        <Text color="primary" variant="label-2" tag="span">
          {title}
        </Text>
        <Text color="primary" variant="label-2" tag="span">
          {description}
        </Text>
      </BreadcrumbTitleContainer>
      <LinkButton href="https://twitter.com/footprint_hq" iconComponent={IcoArrowRightSmall24} target="_blank">
        {twitterLabel}
      </LinkButton>
    </Breadcrumb>
  </BreadcrumbContainer>
);

const Breadcrumb = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
    display: flex;
    justify-content: space-between;
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    width: 100%;

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
    margin-bottom: ${theme.spacing[9]};
  `}
`;

export default TwitterBreadcrumb;
