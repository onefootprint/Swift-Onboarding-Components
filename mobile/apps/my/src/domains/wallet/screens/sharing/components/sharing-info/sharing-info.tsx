import type { CollectedDataOption } from '@onefootprint/types';
import { Box, Tag, Typography } from '@onefootprint/ui';
import React from 'react';
import styled from 'styled-components';

import useTranslation from '@/hooks/use-translation';

export type SharingInfoProps = {
  name: string;
  logo: string;
  fields: CollectedDataOption[];
};

const SharingInfo = ({ name, logo, fields }: SharingInfoProps) => {
  const { t } = useTranslation('cdo');

  return (
    <Box borderRadius="default" borderWidth={1} borderColor="tertiary">
      <Box margin={5}>
        <Logo source={{ uri: logo }} />
        <Typography variant="label-2" marginBottom={3}>
          {name}
        </Typography>
        <Box gap={2} flexDirection="row" flexWrap="wrap">
          {fields.map(field => (
            <Tag key={field}>{t(field)}</Tag>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

const Logo = styled.Image`
  height: 40px;
  width: 40px;
  margin-bottom: 12px;
`;

export default SharingInfo;
