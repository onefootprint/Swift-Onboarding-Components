import { Stack, Text } from '@onefootprint/ui';

type ScrollOptionProps = { title: React.ReactNode; parentTitle?: React.ReactNode };

const ScrollOption = ({ title, parentTitle }: ScrollOptionProps) => {
  return (
    <Stack direction="row" gap={4} alignItems="center">
      <Text variant="label-2">{title}</Text>
      <Text variant="body-2" color="tertiary">
        {parentTitle}
      </Text>
    </Stack>
  );
};

export default ScrollOption;
