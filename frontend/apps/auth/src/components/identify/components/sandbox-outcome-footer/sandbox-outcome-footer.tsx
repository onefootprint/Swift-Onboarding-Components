import styled, { css } from '@onefootprint/styled';
import { Typography } from '@onefootprint/ui';
import React from 'react';

type SandboxOutcomeFooterProps = { label: string; sandboxId?: string };

const SandboxOutcomeFooter = ({
  label,
  sandboxId,
}: SandboxOutcomeFooterProps) =>
  sandboxId ? (
    <Container>
      <Inner>
        <Column>
          <Typography variant="label-4" color="tertiary">
            {label}
          </Typography>
          <Typography variant="label-4" color="secondary">
            {sandboxId}
          </Typography>
        </Column>
        <Column />
      </Inner>
    </Container>
  ) : null;

const Container = styled.footer`
  ${({ theme }) => css`
    margin-top: ${theme.spacing[7]};
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    bottom: 0;
    display: flex;
    justify-content: space-between;
    left: 0;
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
    position: absolute;
    width: 100%;
  `}
`;

const Column = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
  `}
`;

export default SandboxOutcomeFooter;
