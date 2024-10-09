import useEntityId from '@/entity/hooks/use-entity-id';
import useEntityTags from '@/entity/hooks/use-entity-tags';
import { Stack } from '@onefootprint/ui';
import Tag from './components/tag';

const Tags = () => {
  const entityId = useEntityId();
  const { data: tags } = useEntityTags(entityId);
  if (!tags || tags.length === 0) return null;

  return (
    <Stack direction="row" gap={3}>
      <Stack direction="row" gap={2}>
        {tags.map(({ id, tag }) => (
          <Tag text={tag} key={id} />
        ))}
      </Stack>
    </Stack>
  );
};

export default Tags;
