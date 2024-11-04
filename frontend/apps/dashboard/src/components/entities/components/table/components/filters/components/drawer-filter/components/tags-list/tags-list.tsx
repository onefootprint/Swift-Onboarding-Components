import type { OrgTenantTag } from '@onefootprint/request-types/dashboard';
import { Checkbox, LinkButton, Stack } from '@onefootprint/ui';
import { useMemo, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import type { FormData } from '../../drawer-filter.type';

const MAX_TAGS = 10;

type TagsListProps = {
  tags: OrgTenantTag[];
};

const TagsList = ({ tags }: TagsListProps) => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.entities.filters.drawer' });
  const { register, getValues } = useFormContext<FormData>();
  const [showAllTags, setShowAllTags] = useState(false);
  const sortedTags = useMemo(() => {
    const selectedTags = new Set(getValues('tags'));
    return [...tags].sort((a, b) => {
      if (selectedTags.has(a.tag)) {
        return -1;
      }
      if (selectedTags.has(b.tag)) {
        return 1;
      }
      return 0;
    });
  }, [tags]);

  const displayedTags = useMemo(() => {
    return sortedTags.slice(0, showAllTags ? tags.length : MAX_TAGS);
  }, [sortedTags, showAllTags, tags.length]);

  const hasMoreTags = tags.length > MAX_TAGS;

  const handleToggleTags = () => {
    setShowAllTags(prev => !prev);
  };

  return (
    <Stack direction="column" gap={5}>
      <Stack direction="column" gap={3}>
        {displayedTags.map(({ id, tag }) => (
          <Checkbox key={id} label={tag} value={tag} {...register('tags')} />
        ))}
      </Stack>
      {hasMoreTags && (
        <LinkButton onClick={handleToggleTags}>
          {showAllTags ? t('playbooks.show-less') : t('playbooks.show-more')}
        </LinkButton>
      )}
    </Stack>
  );
};

export default TagsList;
