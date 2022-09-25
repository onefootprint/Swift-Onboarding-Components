import { useTranslation } from '@onefootprint/hooks';
import React from 'react';
import { Box, Shimmer, Typography } from 'ui';

import Table from '../table';

const OnboardingConfigsLoading = () => {
  const { t } = useTranslation('pages.developers.onboarding-configs.list-item');

  return (
    <>
      <div role="progressbar" aria-label={t('loading')} />
      <Table aria-hidden>
        <colgroup>
          <col span={1} style={{ width: '35%' }} />
          <col span={1} style={{ width: '40%' }} />
          <col span={1} style={{ width: '25%' }} />
        </colgroup>
        <thead>
          <tr>
            <th>
              <Shimmer
                sx={{
                  backgroundColor: 'neutral',
                  height: '24px',
                  marginBottom: 2,
                  width: '200px',
                }}
              />
              <Shimmer
                sx={{
                  height: '20px',
                  width: '230px',
                  backgroundColor: 'neutral',
                }}
              />
            </th>
            <th>&nbsp;</th>
            <th>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'end',
                }}
              >
                <Shimmer
                  sx={{
                    height: '20px',
                    width: '53px',
                    backgroundColor: 'neutral',
                  }}
                />
              </Box>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('required-data.label')}
              </Typography>
            </td>
            <td>
              <Shimmer sx={{ height: '24px', width: '540px' }} />
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('access-data.label')}
              </Typography>
            </td>
            <td>
              <Shimmer sx={{ height: '24px', width: '300px' }} />
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('key.label')}
              </Typography>
            </td>
            <td>
              <Shimmer sx={{ height: '24px', width: '260px' }} />
            </td>
            <td />
          </tr>
          <tr>
            <td>
              <Typography color="tertiary" variant="body-3">
                {t('status.label')}
              </Typography>
            </td>
            <td>
              <Shimmer sx={{ height: '24px', width: '66px' }} />
            </td>
            <td />
          </tr>
        </tbody>
      </Table>
    </>
  );
};

export default OnboardingConfigsLoading;
