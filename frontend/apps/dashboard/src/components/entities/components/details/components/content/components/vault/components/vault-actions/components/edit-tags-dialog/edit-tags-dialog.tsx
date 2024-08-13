import { Dialog } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';

import { LinkButton, Stack, Text } from '@onefootprint/ui';
import styled, { css } from 'styled-components';

import { Tag } from '@onefootprint/types';
import cloneDeep from 'lodash/cloneDeep';
import isEqual from 'lodash/isEqual';
import { useState } from 'react';
import { WithEntityProps } from 'src/components/entities/components/details/components/with-entity';
import useSession from 'src/hooks/use-session';
import EditableTag from './components/editable-tag';
import { EditableTagKind } from './types';

// const mockActiveTags = [ {tag: 'LTV', createdAt: '1'}, {tag: 'bad', createdAt: '1'}, {tag: 'lost_id', createdAt: '1'}, {tag: 'big_suv', createdAt: '1'}, {tag: 'crashed_car', createdAt: '1'}]
const mockOrgTags = [
  { tag: 'lorem', createdAt: '123' },
  { tag: 'ipsum', createdAt: '123' },
  { tag: 'fraud', createdAt: '123' },
  { tag: 'another', createdAt: '123' },
  { tag: 'scam_user', createdAt: '123' },
  { tag: 'fradulent_user', createdAt: '123' },
  { tag: 'fake_ids', createdAt: '123' },
  { tag: 'fake_SSN', createdAt: '123' },
];

export type EditTagsDialogProps = WithEntityProps & {
  open: boolean;
  onClose: () => void;
};

const EditTagsDialog = ({ entity, open, onClose }: EditTagsDialogProps) => {
  const { t } = useTranslation('common', {
    keyPrefix: 'pages.entity.actions.edit-tags',
  });
  const { data } = useSession();
  const [activeTags, setActiveTags] = useState<Tag[]>(entity.tags ?? []);
  const [isAddingTag, setIsAddingTag] = useState<boolean>(false);
  const inactiveTags = mockOrgTags.filter(tag => !activeTags.find(activeTag => isEqual(tag, activeTag)));

  const handleTagVault = (tagToAdd: Tag) => {
    const newTags = cloneDeep(activeTags);
    newTags.push(tagToAdd);
    setActiveTags(newTags);
  };

  const handleUntagVault = (tagToRemove: Tag) => {
    setActiveTags(activeTags.filter(tag => tag !== tagToRemove));
  };

  const handleClickAdd = () => {
    setIsAddingTag(true);
  };

  const handleSave = () => {
    console.log(activeTags);
  };

  return (
    <Dialog
      size="compact"
      title={t('title')}
      onClose={onClose}
      open={open}
      primaryButton={{
        label: t('save'),
        loading: false,
        disabled: false,
        onClick: handleSave,
      }}
      secondaryButton={{
        label: t('cancel'),
        onClick: onClose,
        disabled: false,
      }}
    >
      <Stack direction="column" justify="flex-start" gap={5}>
        <Text variant="body-3">{t('description')}</Text>
        <ActiveTagsContainer>
          {activeTags.length ? (
            activeTags.map(tag => (
              <EditableTag text={tag.tag} tagKind={EditableTagKind.active} onClick={() => handleUntagVault(tag)} />
            ))
          ) : (
            <Text variant="body-3" color="tertiary" center width="100%">
              {t('empty-active-tags')}
            </Text>
          )}
        </ActiveTagsContainer>
        <Text variant="label-3" color="tertiary">
          {t('inactive-tags', { org: data.org?.name })}
        </Text>
        <InactiveTagsContainer>
          {inactiveTags.map(tag => (
            <EditableTag text={tag.tag} tagKind={EditableTagKind.inactive} onClick={() => handleTagVault(tag)} />
          ))}
        </InactiveTagsContainer>
        <LinkButton onClick={handleClickAdd} disabled={isAddingTag}>
          {t('add-tag')}
        </LinkButton>
      </Stack>
    </Dialog>
  );
};

const ActiveTagsContainer = styled(Stack)`
  ${({ theme }) => css`
    min-height: 52px;
    max-height: 154px;
    max-width: 100%;
    flex-wrap: wrap;
    overflow: scroll;
    padding: ${theme.spacing[5]} ${theme.spacing[4]};
    align-items: center;
    gap: ${theme.spacing[2]};
    border: ${theme.borderWidth[1]} dashed ${theme.borderColor.tertiary};
    border-radius: ${theme.borderRadius.default};
  `}
`;

const InactiveTagsContainer = styled(Stack)`
  ${({ theme }) => css`
    max-height: 154px;
    max-width: 452px;
    flex-wrap: wrap;
    overflow: scroll;
    align-items: center;
    gap: ${theme.spacing[2]};
  `}
`;

export default EditTagsDialog;
