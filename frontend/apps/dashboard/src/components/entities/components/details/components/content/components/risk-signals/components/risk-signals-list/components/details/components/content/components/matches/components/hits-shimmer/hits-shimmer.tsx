import { Box, Shimmer } from '@onefootprint/ui';
import React from 'react';
import styled, { css } from 'styled-components';

const HitsShimmer = () => {
  const renderHitRow = (
    labelWidth: string,
    valueWidth: string,
    isLink?: boolean,
  ) => (
    <Box
      alignItems="center"
      display="flex"
      gap={9}
      justifyContent="space-between"
      width="100%"
    >
      <HitRowItem width={labelWidth} />
      <HitRowItem width={valueWidth} isLink={isLink} />
    </Box>
  );

  return (
    <ShimmerContainer>
      <SourceUrlLabel />
      <SourceUrlCopy />
      <SourceUrlLink />
      <HitContainer>
        <HitIcon />
        {renderHitRow('41px', '81px')}
        {renderHitRow('41px', '126px')}
        {renderHitRow('80px', '186px')}
        {renderHitRow('41px', '81px')}
        {renderHitRow('106px', '81px')}
        {renderHitRow('80px', '81px', true)}
      </HitContainer>
      <HitContainer>
        <HitIcon />
        {renderHitRow('41px', '81px')}
        {renderHitRow('106px', '186px')}
        {renderHitRow('41px', '126px')}
        {renderHitRow('80px', '81px')}
        {renderHitRow('106px', '81px')}
        {renderHitRow('41px', '186px')}
      </HitContainer>
    </ShimmerContainer>
  );
};

const ShimmerContainer = styled.div`
  ${({ theme }) => css`
    width: 100%;
    padding: 0 ${theme.spacing[2]};
    display: flex;
    flex-direction: column;
    filter: blur(7px);
  `}
`;

const HitContainer = styled.div`
  ${({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing[5]};
    margin: ${theme.spacing[3]} 0;
    padding: ${theme.spacing[5]} ${theme.spacing[5]} ${theme.spacing[4]};
  `}
`;

const HitIcon = () => <Shimmer width="16px" height="16px" marginBottom={2} />;

const HitRowItem = ({ width, isLink }: { width: string; isLink?: boolean }) => (
  <Shimmer
    display="block"
    height="20px"
    maxWidth={width}
    textAlign="center"
    flex={1}
    backgroundColor={isLink ? 'accent' : 'secondary'}
    opacity={isLink ? '0.05' : '1'}
  />
);

const SourceUrlLabel = () => (
  <Shimmer width="81px" height="28px" marginBottom={3} />
);

const SourceUrlCopy = () => (
  <Shimmer width="100%" height="20px" marginBottom={5} />
);

const SourceUrlLink = () => (
  <Shimmer
    width="168px"
    height="20px"
    marginBottom={5}
    backgroundColor="accent"
    opacity="0.05"
  />
);

export default HitsShimmer;
