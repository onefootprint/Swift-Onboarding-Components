import { Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import { useTranslation } from 'react-i18next';
import type { EditedTag } from '../../types';
import ActiveTag from './components/active-tag';
import NewTag from './components/new-tag';

export type ActiveTagsProps = {
  activeTags: EditedTag[];
  isAddingTag: boolean;
  onRemove: (tag: EditedTag) => void;
  onRemoveNew: () => void;
  onAddNew: (text: string) => void;
};

const ActiveTags = ({ activeTags, isAddingTag, onRemove, onRemoveNew, onAddNew }: ActiveTagsProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-tags',
  });

  return (
    <Content role="group" aria-label="Active tags">
      {!activeTags.length && !isAddingTag ? (
        <Text variant="body-3" color="tertiary" center width="100%">
          {t('empty-active-tags')}
        </Text>
      ) : (
        activeTags.map(tag => <ActiveTag key={tag.text} text={tag.text} onClick={() => onRemove(tag)} />)
      )}
      {isAddingTag && <NewTag onRemove={onRemoveNew} onAdd={onAddNew} />}
    </Content>
  );
};

const Content = styled(Stack)`
  ${({ theme }) => css`
    min-height: 52px;
    max-height: 154px;
    max-width: 100%;
    flex-wrap: wrap;
    overflow: scroll;
    padding: ${theme.spacing[4]};
    align-items: center;
    gap: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

export default ActiveTags;
