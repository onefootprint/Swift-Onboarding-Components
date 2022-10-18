import { DEMO_BASE_URL } from '@onefootprint/global-constants';
import { useTranslation } from '@onefootprint/hooks';
import { IcoArrowTopRight16 } from '@onefootprint/icons';
import { OnboardingConfig } from '@onefootprint/types';
import { Box, CodeInline, LinkButton, Typography } from '@onefootprint/ui';
import React from 'react';

type OnboardingPublishableKeyRowProps = {
  data: OnboardingConfig;
};

const OnboardingPublishableKeyRow = ({
  data,
}: OnboardingPublishableKeyRowProps) => {
  const { key, isLive } = data;
  const { t } = useTranslation(
    'pages.developers.onboarding-configs.list-item.key',
  );

  return (
    <tr>
      <td>
        <Typography color="tertiary" variant="body-3">
          {t('label')}
        </Typography>
      </td>
      <td>
        <CodeInline>{key}</CodeInline>
      </td>
      <td>
        {isLive ? null : (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <LinkButton
              href={`${DEMO_BASE_URL}/preview?ob_key=${key}`}
              iconComponent={IcoArrowTopRight16}
              size="compact"
              target="_blank"
            >
              {t('cta')}
            </LinkButton>
          </Box>
        )}
      </td>
    </tr>
  );
};

export default OnboardingPublishableKeyRow;
