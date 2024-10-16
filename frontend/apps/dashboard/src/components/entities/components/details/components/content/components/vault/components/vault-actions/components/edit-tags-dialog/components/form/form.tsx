import type { OrgTag, Tag } from '@onefootprint/types';
import { LinkButton, Stack, Text } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useOrgSession from 'src/hooks/use-org-session';
import EntityTag from '../entity-tag';
import NewTag from '../new-tag';
import TagOrg from '../org-tag';

type FormProps = {
  entityTags: Tag[];
  onSubmit: (newTags: string[]) => void;
  orgTags: OrgTag[];
  adding: {
    value: boolean;
    onChange: (value: boolean) => void;
  };
};

const Form = ({ orgTags, entityTags, onSubmit, adding }: FormProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'actions.edit-tags' });
  const org = useOrgSession();
  const [tempEntityTags, setTempEntityTags] = useState<Tag[]>(entityTags);
  const tempOrgTags = orgTags.filter(orgTag => !tempEntityTags.some(({ tag }) => tag === orgTag.tag));

  const handleAdd = (name: string) => {
    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    setTempEntityTags(prev => [...prev, { id, tag: name, createdAt }]);
    adding.onChange(false);
  };

  const handleRemove = (id: string) => {
    setTempEntityTags(prev => prev.filter(tag => tag.id !== id));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(tempEntityTags.map(({ tag }) => tag));
  };

  return (
    <form id="tags-form" onSubmit={handleSubmit}>
      <Stack gap={5} direction="column">
        <Text variant="body-3" marginBottom={5}>
          {t('instructions')}
        </Text>
        <Stack
          borderColor="tertiary"
          borderRadius="default"
          borderStyle="dashed"
          borderWidth={1}
          center={tempEntityTags.length === 0 && !adding.value}
          columnGap={2}
          flexWrap="wrap"
          minHeight="54px"
          padding={4}
          rowGap={3}
        >
          {tempEntityTags.length === 0 && !adding.value ? (
            <Text color="tertiary" variant="body-3">
              {t('empty-active-tags')}
            </Text>
          ) : (
            <AnimatePresence>
              {tempEntityTags.map(({ id, tag }) => (
                <motion.div
                  key={id}
                  initial={{ opacity: 0, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)', width: 'fit-content', transition: { duration: 0.1 } }}
                  exit={{ opacity: 0, filter: 'blur(10px)', width: 0, transition: { duration: 0.1 } }}
                >
                  <EntityTag key={id} text={tag} onClick={() => handleRemove(id)} />
                </motion.div>
              ))}
              {adding.value && <NewTag onCancel={() => adding.onChange(false)} onConfirm={handleAdd} />}
            </AnimatePresence>
          )}
        </Stack>
        {tempOrgTags.length > 0 && (
          <Stack gap={4} flexDirection="column">
            <Text color="tertiary" variant="body-3">
              {t('org-tags', { org: org?.data?.name })}
            </Text>
            <Stack gap={3} flexWrap="wrap" maxHeight="154px">
              <AnimatePresence>
                {tempOrgTags.map(({ id, tag }) => (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)', width: 'fit-content', transition: { duration: 0.1 } }}
                    exit={{ opacity: 0, filter: 'blur(10px)', width: 0, transition: { duration: 0.1 } }}
                  >
                    <TagOrg key={id} text={tag} onClick={() => handleAdd(tag)} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </Stack>
        )}
        <LinkButton variant="label-3" onClick={() => adding.onChange(true)} disabled={adding.value}>
          {t('add')}
        </LinkButton>
      </Stack>
    </form>
  );
};

export default Form;
