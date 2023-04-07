import { useTranslation } from '@onefootprint/hooks';
import { IcoWarning16 } from '@onefootprint/icons';
import { Entity, IdDI } from '@onefootprint/types';
import { Badge, Box, CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { FieldOrPlaceholder } from 'src/components';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import getBadgeVariantByStatus from 'src/components/entities/utils';

type RowProps = {
  entity: Entity;
};

const Row = ({ entity }: RowProps) => {
  const { t } = useTranslation();
  const { data: vault } = useEntityVault(entity.id, entity);
  const badgeVariant = getBadgeVariantByStatus(
    entity.status,
    entity.requiresManualReview,
  );

  return (
    <>
      <td>
        <FieldOrPlaceholder data={vault?.[IdDI.firstName]} />
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
        <FieldOrPlaceholder data={vault?.[IdDI.email]} />
      </td>
      <td>
        <FieldOrPlaceholder data={vault?.[IdDI.ssn9] || vault?.[IdDI.ssn4]} />
      </td>
      <td>
        <FieldOrPlaceholder data={vault?.[IdDI.phoneNumber]} />
      </td>
      <td>
        <Typography
          variant="body-3"
          color="primary"
          sx={{
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
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
