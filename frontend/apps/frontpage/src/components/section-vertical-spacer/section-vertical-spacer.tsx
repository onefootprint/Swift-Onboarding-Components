import { media } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

const SectionSpacer = styled.div<{ double?: boolean }>`
  ${({ double }) => css`
    height: ${double ? '160px' : '80px'};

    ${media.greaterThan('lg')`
    height: ${double ? '312px' : '156px;'};
  `}
  `}
`;

export default SectionSpacer;
