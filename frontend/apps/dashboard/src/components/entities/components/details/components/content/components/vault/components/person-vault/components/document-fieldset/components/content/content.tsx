import useEntitySeqno from '@/entity/hooks/use-entity-seqno';
import { getErrorMessage } from '@onefootprint/request';
import type { Document, Entity, SupportedIdDocTypes } from '@onefootprint/types';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import { useDecryptControls } from '../../../../../vault-actions';
import useDocuments from '../../hooks/use-documents';
import DocumentItem from '../document-item';

type ContentProps = {
  entity: Entity;
};

const Content = ({ entity }: ContentProps) => {
  const seqno = useEntitySeqno();
  const { data: documents, error } = useDocuments(entity.id, seqno);
  const { data: vaultData, update: updateVault } = useEntityVault(entity.id, entity);
  const { vault } = vaultData || {};
  const decryptControls = useDecryptControls();

  const handleDecryptDocument = (documentKind: SupportedIdDocTypes) => {
    decryptControls.decryptToViewDocumentDetails(
      {
        documents: [documentKind],
        entityId: entity.id,
        vaultData: vault,
      },
      {
        onSuccess: newData => {
          updateVault({ vault: newData, transforms: {}, dataKinds: {} });
        },
      },
    );
  };

  return (
    <>
      {error && getErrorMessage(error)}
      {vault && documents && (
        <div className="flex flex-col gap-3">
          {documents.map((document: Document) => (
            <DocumentItem
              key={document.startedAt}
              entity={entity}
              document={document}
              vault={vault}
              onDecrypt={handleDecryptDocument}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Content;
