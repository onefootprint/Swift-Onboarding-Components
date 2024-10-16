import { Shimmer, Stack, media } from '@onefootprint/ui';
import { styled } from 'styled-components';

const Loading = (): JSX.Element => (
  <Container>
    <Stack flexDirection="column" justifyContent="center" alignItems="center" marginBottom={8}>
      <Shimmer height="28px" width="323px" marginBottom={5} />
      <Shimmer height="34px" width="380px" />
    </Stack>
    <Stack flexDirection="column" justifyContent="center" alignItems="center">
      <Shimmer height="66px" width="100%" marginBottom={8} />
      <Shimmer height="66px" width="100%" marginBottom={9} />
      <Shimmer height="42px" width="100%" className="shimmer-cta" />
    </Stack>
  </Container>
);

const Container = styled.div`
  padding-top: 34px;
  
  .shimmer-cta {
    display: none;
  }

  ${media.greaterThan('sm')`
    padding-top: 56px;
    margin-bottom: -9px;
    
    .shimmer-cta {
      display: block;
    }
  `}
`;

export default Loading;
