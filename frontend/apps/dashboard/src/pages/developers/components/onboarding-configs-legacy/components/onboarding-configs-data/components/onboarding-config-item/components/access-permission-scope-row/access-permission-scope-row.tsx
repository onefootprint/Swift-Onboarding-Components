import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import { OnboardingConfig } from '@onefootprint/types';
import { Box, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

import TagList from '../tag-list';

type AccessPermissionScopeRowProps = {
  data: OnboardingConfig;
};

const AccessPermissionScopeRow = ({ data }: AccessPermissionScopeRowProps) => {
  const { id, canAccessData } = data;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.list-item.access-data',
  );
  const items = canAccessData.map(dataAttr => allT(`cdo.${dataAttr}`));

  return (
    <tr>
      <td>
        <Box
          sx={{
            alignItems: 'center',
            display: 'flex',
            flexDirection: 'row',
            gap: 3,
          }}
        >
          <Typography color="tertiary" variant="body-3">
            {t('label')}
          </Typography>
          <Tooltip text={t('tooltip')} placement="bottom-start">
            <Box sx={{ display: 'flex' }}>
              <IcoInfo16 />
            </Box>
          </Tooltip>
        </Box>
      </td>
      <td>
        <TagList items={items} testID={`can-access-data-${id}`} />
      </td>
      <td />
    </tr>
  );
};

export default AccessPermissionScopeRow;
