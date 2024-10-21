import { type DataIdentifier, type Entity, type SupportedIdDocTypes, isVaultDataDecrypted } from '@onefootprint/types';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import useCurrentEntityDocuments from '@/entity/hooks/use-current-entity-documents';

import { useTranslation } from 'react-i18next';
import isDiDecryptable from 'src/utils/is-di-decryptable';
import { useDecryptControls } from '../../../../../../vault-actions';
import { filterDocumentsByKind } from '../../../utils';

export const useDocumentField = (entity: Entity) => {
  const { t } = useTranslation('common', { keyPrefix: 'id_document' });
  const entityVaultWithTransforms = useEntityVault(entity.id, entity);
  const { data: documents } = useCurrentEntityDocuments();
  const decryptControls = useDecryptControls();

  const showCheckbox = decryptControls.inProgress;

  const isDocTypeDecrypted = (docType: SupportedIdDocTypes) => {
    const a = filterDocumentsByKind(documents || [], docType)
      .flatMap(d => d.uploads)
      .map(u => `${u.identifier}:${u.version}` as DataIdentifier)
      .some(di => isVaultDataDecrypted(entityVaultWithTransforms.data?.vault?.[di]));
    return a;
  };

  const canDecryptDocType = (docType: SupportedIdDocTypes) => {
    return (documents || [])
      .filter(d => d.kind === docType)
      .flatMap(d => d.uploads)
      .every(u => isDiDecryptable(entity, u.identifier));
  };

  const getProps = (docType: SupportedIdDocTypes) => {
    return {
      canDecrypt: canDecryptDocType(docType),
      disabled: !canDecryptDocType(docType) || isDocTypeDecrypted(docType),
      label: t(docType) as string,
      showCheckbox,
      isDecrypted: isDocTypeDecrypted(docType),
    };
  };

  return getProps;
};
