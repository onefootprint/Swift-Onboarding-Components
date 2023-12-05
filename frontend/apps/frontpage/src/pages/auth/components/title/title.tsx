import type { Icon } from '@onefootprint/icons';
import { Stack, Typography } from '@onefootprint/ui';
import React from 'react';
import SectionIcon from 'src/components/section-icon';

type TitleProps = {
  icon: Icon;
  title: string;
  subtitle: string;
};

const Title = ({ icon, title, subtitle }: TitleProps) => (
  <Stack direction="column" gap={7} marginTop={10}>
    <SectionIcon icon={icon} />
    <Stack direction="column" gap={2}>
      <Typography variant="display-3">{title}</Typography>
      <Typography variant="display-4" color="secondary">
        {subtitle}
      </Typography>
    </Stack>
  </Stack>
);

export default Title;
