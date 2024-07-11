import { IcoWarning16, type Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';
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
    <Stack direction="column" gap={3}>
      <Text variant="label-1" color={variant === 'error' ? 'error' : 'primary'} textAlign="center">
        {title}
      </Text>
      {description && (
        <Text variant="body-2" color="secondary" textAlign="center" whiteSpace="pre-wrap">
          {description}
        </Text>
      )}
    </Stack>
    <DirectionsContainer>
      {guidelines.length > 0 && (
        <Directions>
          {guidelines.length === 1 ? (
            <Text variant="body-2" textAlign="center" color="secondary">
              {guidelines[0]}
            </Text>
          ) : (
            guidelines.map(guideline => (
              <Text key={guideline} variant="body-2" color="secondary" tag="li" textAlign="left" width="100%">
                {guideline}
              </Text>
            ))
          )}
        </Directions>
      )}
      {alertMessage && (
        <AlertContainer data-has-guidelines={guidelines.length > 0}>
          <Stack height="21px" justifyContent="center" alignItems="center">
            <IcoWarning16 />
          </Stack>
          <Text variant="label-4" textAlign="left">
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
    gap: ${theme.spacing[3]};
    width: 100%;
    background-color: ${theme.backgroundColor.primary};
    padding: ${theme.spacing[4]} ${theme.spacing[5]};
    border-top: 1px dashed ${theme.borderColor.tertiary};
    border-radius: 0 0 ${theme.borderRadius.default}
      ${theme.borderRadius.default};

    &[data-has-guidelines='true'] {
      background-color: ${theme.backgroundColor.secondary};
    }
  `}
`;

export default PromptWithGuidelines;
