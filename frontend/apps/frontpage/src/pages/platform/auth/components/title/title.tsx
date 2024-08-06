import { Stack, Text } from '@onefootprint/ui';
import Image from 'next/image';

type TitleProps = {
  iconSrc?: string;
  title: string;
  subtitle: string;
};

const Title = ({ iconSrc, title, subtitle }: TitleProps) => (
  <Stack direction="column" gap={7} marginTop={10}>
    {iconSrc && <Image src={iconSrc} width={88} height={88} alt="" />}
    <Stack direction="column" gap={2}>
      <Text variant="display-3">{title}</Text>
      <Text variant="display-4" color="secondary">
        {subtitle}
      </Text>
    </Stack>
  </Stack>
);

export default Title;
