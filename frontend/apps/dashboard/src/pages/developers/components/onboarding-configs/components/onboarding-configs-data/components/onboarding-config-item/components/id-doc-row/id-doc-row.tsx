import { useTranslation } from '@onefootprint/hooks';
import { IcoInfo16 } from '@onefootprint/icons';
import { OnboardingConfig } from '@onefootprint/types';
import { Box, Tooltip, Typography } from '@onefootprint/ui';
import React from 'react';

type IdDocRowProps = {
  data: OnboardingConfig;
};

const IdDocRow = ({ data }: IdDocRowProps) => {
  const { mustCollectIdentityDocument, id } = data;
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.list-item.id-doc',
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
          testID={`id-doc-${id}`}
        >
          <Typography color="tertiary" variant="body-3">
            {t('label')}
          </Typography>
          {!mustCollectIdentityDocument && (
            <Tooltip text={t('tooltip')} placement="bottom-start">
              <Box sx={{ display: 'flex' }}>
                <IcoInfo16 />
              </Box>
            </Tooltip>
          )}
        </Box>
      </td>
      <td>
        <Typography variant="label-4" testID={`id-doc-status-${id}`}>
          {mustCollectIdentityDocument ? t('required') : t('not-required')}
        </Typography>
      </td>
      <td />
    </tr>
  );
};

export default IdDocRow;
