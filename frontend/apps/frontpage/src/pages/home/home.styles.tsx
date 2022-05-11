import styled, { css } from 'styled';
import { media } from 'ui';

const HeaderGradient = styled.section`
  background: linear-gradient(
    180deg,
    #e1ddf9 0%,
    #e4e1fa 11.11%,
    #e8e4fa 22.22%,
    #ebe8fb 33.33%,
    #eeecfc 44.44%,
    #f2f0fc 55.56%,
    #f5f4fd 66.67%,
    #f8f7fe 77.78%,
    #fcfbfe 88.89%,
    #ffffff 100%
  );
`;

const FooterContainer = styled.div`
  ${({ theme }) => css`
    background: ${theme.backgroundColor.tertiary};
  `}
`;

const SectionSpacing = styled.div`
  position: relative;

  ${media.between('xs', 'sm')`
    padding-bottom: 100px;
  `}

  ${media.between('sm', 'lg')`
    padding-bottom: 150px;
  `}

  ${media.between('lg', 'xl')`
    padding-bottom: 200px;
  `}

  ${media.greaterThan('xl')`
    padding-bottom: 290px;
  `}
`;

export default { HeaderGradient, SectionSpacing, FooterContainer };
