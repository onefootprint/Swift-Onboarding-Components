import { Box, Text } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

const memojis = ['memoji-1', 'memoji-2', 'memoji-3', 'memoji-4', 'memoji-5'];

export const VerifyIdentities = () => (
  <IllustrationContainer>
    <MemojisContainer>
      {memojis.map((memoji, index) => (
        <Memoji
          key={memoji}
          src={`/industries/featured-cards/memojis/${memoji}.png`}
          alt={memoji}
          width={100}
          height={100}
          $index={index}
        />
      ))}
    </MemojisContainer>
    <Text variant="heading-3" color="success">
      99 / 100
    </Text>
  </IllustrationContainer>
);

const IllustrationContainer = styled(Box)`
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
`;

const MemojisContainer = styled(Box)`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 120%;
  flex-grow: 1;
`;

const Memoji = styled(Image)<{ $index: number }>`
  ${({ $index }) => {
    const getSize = () => {
      if ($index === 2) {
        return '120px';
      }
      if ($index === 1 || $index === 3) {
        return '80px';
      }
      return '60px';
    };

    const size = getSize();
    return css`
      width: ${size};
      height: ${size};
      z-index: ${$index === 2 ? 5 : 4};
    `;
  }}
`;

export default VerifyIdentities;
