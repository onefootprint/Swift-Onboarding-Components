import { Divider, Stack, Text } from '@onefootprint/ui';

type FieldSectionProps = {
  title: string;
  children: React.ReactNode;
  excludeDivider?: boolean;
};

const FieldSection = ({ title, children, excludeDivider }: FieldSectionProps) => (
  <Stack direction="column" gap={6}>
    <Text variant="label-2">{title}</Text>
    {children}
    {!excludeDivider && <Divider />}
  </Stack>
);

export default FieldSection;
