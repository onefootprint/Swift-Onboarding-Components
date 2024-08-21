import type { Entity } from '@onefootprint/types';
import { Stack } from '@onefootprint/ui';
import Tag from './components/tag';

type TagsProps = {
  entity: Entity;
};

const Tags = ({ entity }: TagsProps) => {
  const { tags } = entity;
  if (!tags || tags.length === 0) return null;

  return (
    <Stack direction="row" gap={3}>
      <Stack direction="row" gap={2}>
        {tags.map(tagObject => (
          <Tag text={tagObject.tag} key={tagObject.createdAt} />
        ))}
      </Stack>
    </Stack>
  );
};

export default Tags;
