import { useTranslation } from '@onefootprint/hooks';
import { Typography } from '@onefootprint/ui';
import React from 'react';
import useBifrostMachine from 'src/hooks/use-bifrost-machine';
import styled, { css } from 'styled-components';

import parseSuffix from './utils/parse-suffix';

const SandboxOutcomeFooter = () => {
  const [state] = useBifrostMachine();
  const { t } = useTranslation('components.sandbox-outcome-footer');
  const { sandboxSuffix } = state.context;

  return sandboxSuffix ? (
    <Container>
      <Inner>
        <Typography variant="label-4" color="tertiary">
          {t('outcome')}
        </Typography>
        <Typography variant="label-4" color="secondary">
          {parseSuffix(sandboxSuffix).outcome}
        </Typography>
      </Inner>
      <Inner>
        <Typography variant="label-4" color="tertiary">
          {t('testID')}
        </Typography>
        <Typography variant="label-4" color="secondary">
          {parseSuffix(sandboxSuffix).testID}
        </Typography>
      </Inner>
    </Container>
  ) : null;
};

const Container = styled.footer`
  ${({ theme }) => css`
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    display: flex;
    justify-content: space-between;
    margin-bottom: calc(-1 * ${theme.spacing[7]});
    margin-left: calc(-1 * ${theme.spacing[7]});
    margin-right: calc(-1 * ${theme.spacing[7]});
    margin-top: ${theme.spacing[7]};
    padding: ${theme.spacing[2]} ${theme.spacing[5]};
  `}
`;

const Inner = styled.div`
  ${({ theme }) => css`
    display: flex;
    gap: ${theme.spacing[2]};
    justify-content: space-between;
  `}
`;

export default SandboxOutcomeFooter;
