import { Typography } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type SquaredFeatureCardType = {
  title: string;
  body: string;
  children?: React.ReactNode;
  background?: string;
};

const SquaredFeatureCard = ({
  children,
  title,
  body,
  background,
}: SquaredFeatureCardType) => (
  <Container data-background={background}>
    <Inner>
      <Typography as="h3" color="primary" variant="label-2">
        {title}
      </Typography>
      <Typography as="p" color="secondary" variant="body-2">
        {body}
      </Typography>
    </Inner>
    {children}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    position: relative;
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[9]};
    padding: ${theme.spacing[8]};
    width: 100%;
    height: 480px;
    border-radius: ${theme.borderRadius.default};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    overflow: hidden;

    &:before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #f7f7f7;
      backdrop-filter: (8px);
      opacity: 40%;
    }
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    text-align: left;
    z-index: 1;

    p {
      max-width: 460px;
    }
  `}
`;

export default SquaredFeatureCard;
