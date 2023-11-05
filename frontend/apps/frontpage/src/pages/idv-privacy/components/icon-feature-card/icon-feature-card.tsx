import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import { Trans } from 'react-i18next';

type IconFeatureCardProps = {
  title: string;
  description: string;
  icon: Icon;
  // @ts-ignore: fix me
  trans?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};

const IconFeatureCard = ({
  title,
  description,
  icon: Icon,
  trans,
}: IconFeatureCardProps) => {
  const icon = Icon && <Icon />;
  return (
    <Container>
      <IconContainer>{icon}</IconContainer>
      <Typography variant="label-2">{title}</Typography>
      <Typography variant="body-2" color="secondary">
        {trans ? (
          <Trans i18nKey={trans.i18nKey} components={trans.components} />
        ) : (
          description
        )}
      </Typography>
    </Container>
  );
};

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: ${theme.spacing[4]};
    max-width: 400px;
    padding: ${theme.spacing[4]};
    overflow: hidden;
  `}
`;

const IconContainer = styled.div`
  ${({ theme }) => css`
    width: 40px;
    height: 40px;
    border-radius: ${theme.borderRadius.full};
    border: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: ${theme.spacing[3]};
  `}
`;

export default IconFeatureCard;
