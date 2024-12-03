import { Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

type AuthorProps = {
  name: string;
  avatarUrl: string;
};

const Author = ({ name, avatarUrl }: AuthorProps) => (
  <Stack direction="row" alignItems="center" gap={4}>
    {avatarUrl && (
      <AuthorImg>
        <Image alt={`Image of ${name}`} src={avatarUrl} height={32} width={32} />
      </AuthorImg>
    )}
    <Text variant="label-3">{name}</Text>
  </Stack>
);

const AuthorImg = styled.div`
  ${({ theme }) => css`
    border-radius: ${theme.borderRadius.full};
    overflow: hidden;
    width: 32px;
    height: 32px;

    img {
      object-fit: cover;
      width: 100%;
      height: 100%;
    }
  `}
`;

export default Author;
