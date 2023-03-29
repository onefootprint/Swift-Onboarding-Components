import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { BusinessDI, Entity } from '@onefootprint/types';
import { Badge, Box, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { FieldOrPlaceholder } from 'src/components';

import useEntityVault from '@/businesses/hooks/use-entity-vault';
import getBadgeVariantByStatus from '@/businesses/utils';

type RowProps = {
  entity: Entity;
};

// TODO: https://linear.app/footprint/issue/FP-3097/business-list-user-list-use-right-function-to-format-date
const Row = ({ entity }: RowProps) => {
  const { t } = useTranslation();
  const [vault] = useEntityVault(entity.id, entity);
  const badgeVariant = getBadgeVariantByStatus(
    entity.status,
    entity.requiresManualReview,
  );

  return (
    <>
      <td>
        <FieldOrPlaceholder data={vault[BusinessDI.name]} />
      </td>
      <td>
        <CodeInline isPrivate truncate>
          {entity.id}
        </CodeInline>
      </td>
      <td>
        <Badge variant={badgeVariant}>
          {t(`entity-statuses.${entity.status}`)}
          {entity.requiresManualReview && (
            <Box sx={{ marginLeft: 2 }}>
              <IcoWarning16 color={badgeVariant} />
            </Box>
          )}
        </Badge>
      </td>
      <td>
        <FieldOrPlaceholder data={vault[BusinessDI.beneficialOwners]} />
      </td>
      <td>
        <Typography variant="body-3" color="primary">
          {new Date(entity.startTimestamp).toLocaleString('en-us', {
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
