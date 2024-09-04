import useEntityId from '@/entity/hooks/use-entity-id';
import useTags from '@/entity/hooks/use-tags';
import { Stack } from '@onefootprint/ui';
import Tag from './components/tag';

const Tags = () => {
  const entityId = useEntityId();
  const { data: tags } = useTags(entityId);
  if (!tags || tags.length === 0) return null;

  return (
    <Stack direction="row" gap={3}>
      <Stack direction="row" gap={2}>
        {tags.map(({ id, text }) => (
          <Tag text={text} key={id} />
        ))}
      </Stack>
    </Stack>
  );
};

export default Tags;
