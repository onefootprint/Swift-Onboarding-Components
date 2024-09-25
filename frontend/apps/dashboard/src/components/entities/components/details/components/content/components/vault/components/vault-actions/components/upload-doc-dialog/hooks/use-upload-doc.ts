import { useRequestErrorToast } from '@onefootprint/hooks';
import request from '@onefootprint/request';
import type { CustomDocumentIdentifier } from '@onefootprint/types';
import { DataKind } from '@onefootprint/types';
import { detectMimeType, useToast } from '@onefootprint/ui';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { AuthHeaders } from 'src/hooks/use-session';
import useSession from 'src/hooks/use-session';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import useCurrentEntity from '@/entity/hooks/use-current-entity';

type EntityDocumentUploadRequest = {
  entityId: string;
  identifier: CustomDocumentIdentifier;
  file: File;
};

const uploadDoc = async (authHeaders: AuthHeaders, { entityId, identifier, file }: EntityDocumentUploadRequest) => {
  const arrayBuffer = await file.arrayBuffer();
  const rawImage = new Uint8Array(arrayBuffer);

  const mimeType = detectMimeType(Buffer.from(rawImage));

  const response = await request({
    method: 'POST',
    url: `/entities/${entityId}/vault/${identifier}/upload`,
    data: rawImage,
    headers: {
      ...authHeaders,
      'Content-Type': mimeType,
    },
  });

  return response.data;
};

const useUploadDoc = () => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.upload-doc',
  });
  const { authHeaders } = useSession();
  const queryClient = useQueryClient();
  const toast = useToast();
  const toastError = useRequestErrorToast();
  const entity = useCurrentEntity();
  const entityVault = useEntityVault(entity.data?.id, entity.data);

  async function updateEntityVault(payload: {
    identifier: CustomDocumentIdentifier;
    file: File;
  }) {
    try {
      const base64String = await fileToBase64(payload.file);
      const base64Data = base64String.split(',')[1]; // Remove the Data URL prefix

      entityVault.update({
        dataKinds: {
          [payload.identifier]: DataKind.documentData,
        },
        vault: {
          [payload.identifier]: base64Data,
        },
        transforms: {
          [payload.identifier]: {},
        },
      });
    } catch (error) {
      console.error('Error converting file to base64:', error);
    }
  }

  return useMutation({
    mutationFn: async (data: {
      identifier: CustomDocumentIdentifier;
      file: File;
    }) => {
      if (!entity.data) throw new Error('Entity must be defined');
      return uploadDoc(authHeaders, { ...data, entityId: entity.data.id });
    },
    onSuccess: (_response, payload) => {
      toast.show({
        title: t('feedback.success.title'),
        description: t('feedback.success.description'),
      });
      queryClient.invalidateQueries();
      updateEntityVault(payload);
    },
    onError: toastError,
  });
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
}

export default useUploadDoc;
