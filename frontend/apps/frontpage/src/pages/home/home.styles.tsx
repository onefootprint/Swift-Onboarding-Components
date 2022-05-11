import styled from 'styled';

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

const SectionSpacing = styled.div`
  padding-bottom: 300px;
`;

export const WhyGradient = styled.div`
  background: linear-gradient(
    0deg,
    rgba(118, 251, 143, 0.4) 0%,
    rgba(118, 251, 143, 0) 100%
  );
`;

export default { HeaderGradient, SectionSpacing };
