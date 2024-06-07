import { Text, createFontStyles, media } from '@onefootprint/ui';
import React from 'react';
import { Trans } from 'react-i18next';
import styled, { css } from 'styled-components';

type FeatureCardProps = {
  title: string;
  description: string;
  // @ts-ignore: fix me
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  trans?: any;
};

const FeatureCard = ({ title, description, trans }: FeatureCardProps) => (
  <Container>
    <Title>{title}</Title>
    <Text variant="body-2">
      {trans ? <Trans i18nKey={trans.i18nKey} components={trans.components} /> : description}
    </Text>
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    position: relative;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: ${theme.spacing[4]};
    max-width: 520px;
    isolation: isolate;

    ${media.greaterThan('md')`
      padding-left: ${theme.spacing[9]};
    `}

    &::before {
      display: none;

      ${media.greaterThan('md')`
        display: block;
        z-index: 0;
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        height: 100%;
        width: ${theme.borderWidth[1]};
        background: radial-gradient(
          100% 100% at 50% 0%,
          ${theme.borderColor.primary} 0%,
          ${theme.borderColor.transparent} 100%
        );
      `}
    }
  `};
`;

const Title = styled.h3`
  ${({ theme }) => css`
    ${createFontStyles('label-1')}
    color: ${theme.color.primary};
    position: relative;
    text-align: left;
    width: 100%;

    &::before {
      display: none;

      ${media.greaterThan('md')`
        ${createFontStyles('label-2')}
        display: block;
        content: '';
        position: absolute;
        z-index: 1;
        left: calc(-1 * ${theme.spacing[9]});
        top: 0;
        height: 100%;
        width: ${theme.borderWidth[1]};
        background-color: ${theme.borderColor.secondary};
      `}
    }
  `};
`;

export default FeatureCard;
