import { Stack } from '@onefootprint/ui';
import Image from 'next/image';
import styled from 'styled-components';

type UserPhotoProps = {
  src: string;
  className?: string;
};

const UserPhoto = ({ src, className }: UserPhotoProps) => (
  <Container align="center" justify="center" className={className}>
    <StyledImage src={src} alt="User photo" width={120} height={120} />
  </Container>
);

const Container = styled(Stack)`
  border-radius: 14px;
  overflow: hidden;
  padding: 8px;
  box-shadow:
    -8px 8px 4px 0px rgba(255, 255, 255, 0.16) inset,
    0px 1px 4px 0px rgba(0, 0, 0, 0.12);
`;

const StyledImage = styled(Image)`
  border-radius: 10px;
  box-shadow:
    inset 0px 0px 0px 1px rgba(0, 0, 0, 0.12),
    inset 0px 0px 10px 2px rgba(0, 0, 0, 0.1);
`;

export default UserPhoto;
