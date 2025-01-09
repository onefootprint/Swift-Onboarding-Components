import { getErrorMessage } from '@onefootprint/request';
import type { Document, Entity, EntityVault, SupportedIdDocTypes } from '@onefootprint/types';
import type { VaultType } from 'src/components/entities/hooks/use-entity-vault';
import { useDecryptControls } from '../../../../../vault-actions';
import DocumentItem from '../document-item';

type ContentProps = {
  entity: Entity;
  error: Error | null;
  documents: Document[] | undefined;
  updateVault: (newData: VaultType) => void;
  vault: EntityVault | undefined;
};

const Content = ({ entity, error, documents, vault, updateVault }: ContentProps) => {
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
