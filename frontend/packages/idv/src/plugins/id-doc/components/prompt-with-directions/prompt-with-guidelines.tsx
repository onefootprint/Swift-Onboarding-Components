import { type Icon, IcoWarning16 } from '@onefootprint/icons';
import { Box, Text } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

type PromptWithGuidelinesProps = {
  icon?: Icon;
  guidelines: string[];
  title: string;
  description?: string;
  alertMessage?: string;
  variant?: 'default' | 'error';
};

const PromptWithGuidelines = ({
  icon: Icon,
  guidelines,
  description,
  alertMessage,
  title,
  variant = 'default',
}: PromptWithGuidelinesProps) => (
  <Container>
    {Icon && <Icon color={variant === 'error' ? 'error' : 'primary'} />}
    <Box gap={3}>
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
    </Box>
    <DirectionsContainer>
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
      {alertMessage && (
        <AlertContainer>
          <Box>
            <IcoWarning16 />
          </Box>
          <Text variant="label-3" textAlign="left">
            {alertMessage}
          </Text>
        </AlertContainer>
      )}
    </DirectionsContainer>
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

const DirectionsContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    width: 100%;
    background-color: ${theme.backgroundColor.secondary};
    border-radius: ${theme.borderRadius.default};
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
    padding: ${theme.spacing[5]};
  `}
`;

const AlertContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    justify-content: start;
    align-items: center;
    gap: ${theme.spacing[3]};
    width: 100%;
    background-color: ${theme.backgroundColor.secondary};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    border-top: 1px dashed ${theme.borderColor.tertiary};
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};
  `}
`;

export default PromptWithGuidelines;
