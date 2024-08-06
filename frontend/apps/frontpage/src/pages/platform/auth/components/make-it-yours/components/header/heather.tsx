import { Stack, Text } from '@onefootprint/ui';

import BirdIcon from '../bird-icon';

type HeatherProps = {
  title: string;
  subtitle: string;
};

const Heather = ({ title, subtitle }: HeatherProps) => (
  <Stack direction="column" gap={5} align="center">
    <BirdIcon />
    <Stack direction="column" gap={3} align="center" maxWidth="600px" textAlign="center">
      <Text variant="display-3">{title}</Text>
      <Text variant="display-4" color="tertiary">
        {subtitle}
      </Text>
    </Stack>
  </Stack>
);

export default Heather;
