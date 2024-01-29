import type { Icon } from '@onefootprint/icons';
import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type PromptWithGuidelinesProps = {
  icon: Icon;
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
    <Icon color={variant === 'error' ? 'error' : 'primary'} />
    <Typography
      variant="label-1"
      color={variant === 'error' ? 'error' : 'primary'}
      sx={{ textAlign: 'center' }}
    >
      {title}
    </Typography>
    {description && (
      <Typography
        variant="body-2"
        color="secondary"
        sx={{
          textAlign: 'center',
        }}
      >
        {description}
      </Typography>
    )}
    {guidelines.length > 0 && (
      <Directions>
        {guidelines.length === 1 ? (
          <Typography
            variant="body-2"
            color="secondary"
            sx={{
              textAlign: 'center',
            }}
          >
            {guidelines[0]}
          </Typography>
        ) : (
          guidelines.map(guideline => (
            <Typography
              key={guideline}
              variant="body-2"
              color="secondary"
              as="li"
              sx={{
                textAlign: 'left',
                width: '100%',
              }}
            >
              {guideline}
            </Typography>
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
