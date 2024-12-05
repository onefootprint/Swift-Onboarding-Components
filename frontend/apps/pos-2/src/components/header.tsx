import { Stack, Text } from '@onefootprint/ui';

type HeaderProps = {
  title: string;
  subtitle: string;
};

const Header = ({ title, subtitle }: HeaderProps) => {
  return (
    <Stack direction="column" gap={3}>
      <Text variant="heading-3">{title}</Text>
      <Text variant="body-2" color="secondary">
        {subtitle}
      </Text>
    </Stack>
  );
};

export default Header;
