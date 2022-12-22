import { media, Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type DetailsLayoutTypes = {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
  type?: string;
  background?: string;
};

const DetailsLayout = ({
  children,
  title,
  subtitle,
  type,
  background,
}: DetailsLayoutTypes) => (
  <LayoutWrapper>
    <TitleWrapper data-background={background}>
      <ResponsiveHide data-viewport="tablet-desktop">
        <Typography as="h2" color="primary" variant="display-1">
          {title}
        </Typography>
      </ResponsiveHide>
      <ResponsiveHide data-viewport="mobile">
        <Typography as="h2" color="primary" variant="display-2">
          {title}
        </Typography>
      </ResponsiveHide>
      <Typography as="h3" color="primary" variant="display-4">
        {subtitle}
      </Typography>
    </TitleWrapper>
    {type === 'regular' ? (
      <RegularGrid>{children}</RegularGrid>
    ) : (
      <ContentAndImageWrapper>{children}</ContentAndImageWrapper>
    )}
  </LayoutWrapper>
);

const LayoutWrapper = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    width: 100%;
    isolation: isolate;
    z-index: 1;
    gap: ${theme.spacing[9]};
    transition: 1.5s;
  `}
`;

const TitleWrapper = styled.div`
  ${({ theme }) => css`
    max-width: 95%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
    gap: ${theme.spacing[6]};
    max-width: 800px;
  `}
`;

const ResponsiveHide = styled.span`
  z-index: 1;
  &[data-viewport='mobile'] {
    display: block;

    ${media.greaterThan('sm')`
      display: none;
    `}
  }

  &[data-viewport='tablet-desktop'] {
    display: none;

    ${media.greaterThan('sm')`
      display: block;
    `}
  }
`;

const ContentAndImageWrapper = styled.div`
  ${({ theme }) => css`
    display: grid;
    gap: ${theme.spacing[9]};
    width: 100%;
    padding: 0 ${theme.spacing[4]};
    align-items: center;
    grid-template-columns: 1fr;
    grid-template-rows: 400px 1fr;
    grid-template-areas:
      'image image'
      'features features';

    ${media.greaterThan('sm')`
      grid-template-rows: 1fr 1fr;
    `}

    ${media.greaterThan('md')`    
      grid-template-columns: 1fr 1fr 1fr;
      grid-template-rows: 1fr;
      grid-template-areas: 'features image image';
      padding: ${theme.spacing[9]};
    `}
  `}
`;

const RegularGrid = styled.div`
  ${({ theme }) => css`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: unset;
    gap: ${theme.spacing[5]};
    width: 100%;
    padding-bottom: ${theme.spacing[10]};
    align-items: center;

    ${media.greaterThan('md')`
      padding: ${theme.spacing[9]};
      grid-template-columns: 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      gap: ${theme.spacing[7]};
    `}
  `}
`;

export default DetailsLayout;
