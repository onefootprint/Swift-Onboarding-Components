import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import type { EntityKind, OrgTag } from '@onefootprint/types';
import { useTranslation } from 'react-i18next';
import ErrorComponent from 'src/components/error';
import useSession from 'src/hooks/use-session';
import useOrgTags from '../../hooks/use-org-tags';
import type { EditedTag } from '../../types';
import InactiveTag from './components/inactive-tag';

export type InactiveTagsProps = {
  entityKind: EntityKind;
  activeTags: EditedTag[];
  onClick: (tag: OrgTag) => void;
};

const InactiveTags = ({ entityKind, activeTags, onClick }: InactiveTagsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header.actions.edit-tags',
  });
  const {
    data: { org },
  } = useSession();
  const { data: orgTags, error } = useOrgTags(entityKind);
  const inactiveTags = orgTags?.[entityKind]?.filter(
    ({ text: orgTagText }) => !activeTags.find(({ text: activeTagText }) => activeTagText === orgTagText),
  );

  if (error || inactiveTags?.length) {
    return (
      <Stack direction="column" justify="flex-start" gap={5} role="group" aria-label="Inactive tags">
        <Text variant="label-3" color="tertiary">
          {t('inactive-tags', { org: org?.name })}
        </Text>
        {error ? (
          <ErrorComponent error={error} />
        ) : (
          <Tags>
            {inactiveTags?.map(tag => (
              <InactiveTag key={tag.id} text={tag.text} onClick={() => onClick(tag)} />
            ))}
          </Tags>
        )}
      </Stack>
    );
  }
  return null;
};

const Tags = styled(Stack)`
  ${({ theme }) => css`
    max-height: 154px;
    max-width: 452px;
    flex-wrap: wrap;
    overflow: scroll;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

export default InactiveTags;
