import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import { CollectedKycDataOption, OnboardingConfig } from '@onefootprint/types';
import { Box, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

import TagList from '../tag-list';

type RequiredDataToBeCollectedRowProps = {
  data: OnboardingConfig;
};

const RequiredDataToBeCollectedRow = ({
  data,
}: RequiredDataToBeCollectedRowProps) => {
  const { id, mustCollectData } = data;
  const { t, allT } = useTranslation(
    'pages.developers.onboarding-configs.list-item.required-data',
  );

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
        <TagList
          dataList={mustCollectData}
          getLabel={(tag: CollectedKycDataOption) =>
            allT(`collected-kyc-data-options.${tag}`)
          }
          testID={`must-collect-data-${id}`}
        />
      </td>
      <td />
    </tr>
  );
};

export default RequiredDataToBeCollectedRow;
