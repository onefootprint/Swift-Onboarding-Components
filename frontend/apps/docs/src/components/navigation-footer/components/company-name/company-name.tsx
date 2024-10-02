import { IcoBuilding16 } from '@onefootprint/icons';
import { Box, Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';
import styled, { css } from 'styled-components';

type CompanyNameProps = {
  name: string | null;
  image?: string | null;
};

const CompanyName = ({ name, image }: CompanyNameProps) => {
  return (
    <Stack direction="row" alignItems="center" gap={3} maxWidth="100%" overflow="hidden" marginRight={3}>
      <LogoContainer>
        {image ? <Image src={image} alt="company logo" width={16} height={16} priority /> : <IcoBuilding16 />}
      </LogoContainer>
      <Text variant="label-3" truncate>
        {name}
      </Text>
    </Stack>
  );
};

const LogoContainer = styled(Box)`
${({ theme }) => css`
    border-radius: ${theme.borderRadius.sm};
    display: flex;
    flex-shrink: 0;
    overflow: hidden;
    width: 16px;
    height: 16px;
  `}
`;

export default CompanyName;
