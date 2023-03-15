import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { Badge, Box, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { FieldOrPlaceholder } from 'src/components';

import type { Business } from '@/businesses/types';
import getBadgeVariantByStatus from '@/businesses/utils';

type RowProps = {
  business: Business;
};

// TODO: https://linear.app/footprint/issue/FP-3089/business-details-add-submitted-by
// TODO: https://linear.app/footprint/issue/FP-3097/business-list-user-list-use-right-function-to-format-date
const Row = ({ business }: RowProps) => {
  const { t } = useTranslation();
  const badgeVariant = getBadgeVariantByStatus(
    business.status,
    business.requiresManualReview,
  );

  return (
    <>
      <td>{business.name}</td>
      <td>
        <CodeInline isPrivate truncate>
          {business.id}
        </CodeInline>
      </td>
      <td>
        <Badge variant={badgeVariant}>
          {t(`entity-statuses.${business.status}`)}
          {business.requiresManualReview && (
            <Box sx={{ marginLeft: 2 }}>
              <IcoWarning16 color={badgeVariant} />
            </Box>
          )}
        </Badge>
      </td>
      <td>
        <FieldOrPlaceholder data={null} />
      </td>
      <td>
        <Typography variant="body-3" color="primary">
          {new Date(business.startTimestamp).toLocaleString('en-us', {
            month: 'numeric',
            day: 'numeric',
            year: '2-digit',
            hour: 'numeric',
            minute: 'numeric',
          })}
        </Typography>
      </td>
    </>
  );
};

export default Row;
