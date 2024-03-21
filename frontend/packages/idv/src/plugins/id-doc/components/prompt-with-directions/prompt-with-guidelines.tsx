import type { Icon } from '@onefootprint/icons';
import { Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type PromptWithGuidelinesProps = {
  icon?: Icon;
  guidelines: string[];
  title: string;
  description?: string;
  variant?: 'default' | 'error';
};

const PromptWithGuidelines = ({
  icon: Icon,
  guidelines,
  description,
  title,
  variant = 'default',
}: PromptWithGuidelinesProps) => (
  <Container>
    {Icon && <Icon color={variant === 'error' ? 'error' : 'primary'} />}
    <Text
      variant="label-1"
      color={variant === 'error' ? 'error' : 'primary'}
      textAlign="center"
    >
      {title}
    </Text>
    {description && (
      <Text variant="body-2" color="secondary" textAlign="center">
        {description}
      </Text>
    )}
    {guidelines.length > 0 && (
      <Directions>
        {guidelines.length === 1 ? (
          <Text variant="body-2" textAlign="center" color="secondary">
            {guidelines[0]}
          </Text>
        ) : (
          guidelines.map(guideline => (
            <Text
              key={guideline}
              variant="body-2"
              color="secondary"
              tag="li"
              textAlign="left"
              width="100%"
            >
              {guideline}
            </Text>
          ))
        )}
      </Directions>
    )}
  </Container>
);

const Container = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: ${theme.spacing[5]};
    width: 100%;
  `}
`;

const Directions = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    width: 100%;
    gap: ${theme.spacing[3]};
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[5]};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default PromptWithGuidelines;
