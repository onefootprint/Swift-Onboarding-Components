import { useRequestErrorToast } from '@onefootprint/hooks';
import type { Entity, Tag } from '@onefootprint/types';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import useEntityAddTag from 'src/hooks/use-entity-add-tag';
import useEntityRemoveTag from 'src/hooks/use-entity-remove-tag';
import useOrgCreateTag from 'src/hooks/use-org-create-tag';

type ManageTagsParams = {
  orgTagsToCreate: string[];
  entityTagsToAdd: string[];
  entityTagsToRemove: Tag[];
};

const useManageTags = (entity: Entity) => {
  const queryClient = useQueryClient();
  const orgCreateMutation = useOrgCreateTag();
  const entityAddMutation = useEntityAddTag();
  const entityRemoveMutation = useEntityRemoveTag();
  const showErrorToast = useRequestErrorToast();

  return useMutation({
    mutationFn: async ({ orgTagsToCreate, entityTagsToAdd, entityTagsToRemove }: ManageTagsParams) => {
      const mutations = [];
      if (orgTagsToCreate.length > 0) {
        mutations.push(...orgTagsToCreate.map(tag => orgCreateMutation.mutateAsync({ kind: entity.kind, text: tag })));
      }
      if (entityTagsToAdd.length > 0) {
        mutations.push(...entityTagsToAdd.map(text => entityAddMutation.mutateAsync({ text, entityId: entity.id })));
      }
      if (entityTagsToRemove.length > 0) {
        mutations.push(
          ...entityTagsToRemove.map(({ id }) => entityRemoveMutation.mutateAsync({ entityId: entity.id, tagId: id })),
        );
      }
      await Promise.all(mutations);
    },
    onSuccess: () => {
      queryClient.invalidateQueries();
    },
    onError: error => {
      showErrorToast(error);
    },
  });
};

export default useManageTags;
