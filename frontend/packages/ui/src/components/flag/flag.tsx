import type { CountryCode } from '@onefootprint/types';
import styled, { css } from 'styled-components';

export type FlagProps = {
  className?: string;
  code: CountryCode;
  testID?: string;
};

const Flag = ({ code, testID, className = '' }: FlagProps) => (
  <NotAnimatedFlagShimmer className={`fp-f f-${code} ${className}`} data-testid={testID} />
);

const NotAnimatedFlagShimmer = styled.div`
  ${({ theme }) => css`
    width: 20px;
    height: 15px;
    background-color: ${theme.backgroundColor.senary};
  `}
`;

export default Flag;
