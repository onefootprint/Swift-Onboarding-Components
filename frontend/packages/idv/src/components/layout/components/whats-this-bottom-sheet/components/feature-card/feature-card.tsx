import type { Icon } from '@onefootprint/icons';
import { Stack, Text } from '@onefootprint/ui';

type FeatureCardProps = {
  title: string;
  subtitle: string;
  icon: Icon;
};

const FeatureCard = ({ title, subtitle, icon: Icon }: FeatureCardProps) => {
  const renderedIcon = Icon && <Icon color="primary" />;
  return (
    <Stack
      direction="column"
      gap={3}
      paddingTop={4}
      paddingBottom={4}
      paddingLeft={5}
      paddingRight={5}
      backgroundColor="secondary"
      borderRadius="default"
    >
      <Stack direction="row" gap={3} align="center" justify="start">
        {renderedIcon}
        <Text variant="label-4">{title}</Text>
      </Stack>
      <Text variant="body-4" color="secondary">
        {subtitle}
      </Text>
    </Stack>
  );
};

export default FeatureCard;
