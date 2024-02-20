import { type Entity, IdDI } from '@onefootprint/types';
import { CodeInline, Typography } from '@onefootprint/ui';
import React from 'react';
import { StatusBadge } from 'src/components';
import Tags from 'src/components/entities/components/tags';

type RowProps = {
  entity: Entity;
};

const getName = (entity: Entity) => {
  const attributes = entity.data;

  // find an attribute in attributes that has identifier with value IdDI.fistName
  const firstNameAttribute = attributes.find(
    attribute => attribute.identifier === IdDI.firstName,
  );

  // find an attribute in attributes that has identifier with value IdDI.lastName
  const lastNameAttribute = attributes.find(
    attribute => attribute.identifier === IdDI.lastName,
  );

  if (!firstNameAttribute) {
    return '-';
  }

  const firstName = firstNameAttribute.value;
  if (!firstName) {
    return '-';
  }

  const lastNameInitial = lastNameAttribute?.transforms.prefix_1
    ? `${lastNameAttribute.transforms.prefix_1}.`
    : '';

  const name = `${firstName} ${lastNameInitial}`;
  return name;
};

const Row = ({ entity }: RowProps) => (
  <>
    <td>
      <Typography
        variant="body-3"
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {getName(entity)}
      </Typography>
    </td>
    <td>
      <CodeInline isPrivate truncate>
        {entity.id}
      </CodeInline>
    </td>
    <td aria-label="status badge">
      <StatusBadge
        status={entity.status}
        requiresManualReview={entity.requiresManualReview}
      />
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
        {new Date(entity.lastActivityAt).toLocaleString('en-us', {
          month: 'numeric',
          day: 'numeric',
          year: '2-digit',
          hour: 'numeric',
          minute: 'numeric',
        })}
      </Typography>
    </td>
    <td aria-label="tags">
      <Tags entity={entity} />
    </td>
  </>
);

export default Row;
