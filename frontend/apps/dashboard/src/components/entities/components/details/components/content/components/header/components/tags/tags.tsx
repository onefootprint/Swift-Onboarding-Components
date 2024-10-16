import useEntityId from '@/entity/hooks/use-entity-id';
import useEntityTags from '@/entity/hooks/use-entity-tags';
import { Stack } from '@onefootprint/ui';
import { AnimatePresence, motion } from 'framer-motion';
import styled from 'styled-components';
import Tag from './components/tag';

const Tags = () => {
  const entityId = useEntityId();
  const { data: tags } = useEntityTags(entityId);

  const tagVariants = {
    initial: { filter: 'blur(10px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    exit: { filter: 'blur(10px)', opacity: 0 },
  };

  const containerVariants = {
    open: { height: 'auto', opacity: 1, transition: { duration: 0.1, ease: 'easeInOut' } },
    closed: { height: 0, opacity: 0, transition: { duration: 0.1, ease: 'easeInOut' } },
  };

  return (
    <AnimatePresence>
      {tags && tags.length > 0 && (
        <TagsContainer
          initial="closed"
          animate="open"
          exit="closed"
          variants={containerVariants}
          transition={{ duration: 0.1, ease: 'easeInOut' }}
        >
          <Stack direction="row" gap={3}>
            <Stack direction="row" gap={2}>
              <AnimatePresence>
                {tags.map(({ id, tag }) => (
                  <motion.div
                    key={id}
                    variants={tagVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                  >
                    <Tag text={tag} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </Stack>
          </Stack>
        </TagsContainer>
      )}
    </AnimatePresence>
  );
};

const TagsContainer = styled(motion.div)`
  overflow: hidden;
`;

export default Tags;
