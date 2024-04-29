import type {
  CustomDocumentRequirementConfig,
  DocumentRequirementConfig,
} from '@onefootprint/types';
import { DocumentRequestKind } from '@onefootprint/types';

const getCustomDocInfo = (config: DocumentRequirementConfig) => {
  const documentRequestKind = config.kind;
  let documentName: string | undefined;
  let documentDescription: string | undefined;
  if (documentRequestKind === DocumentRequestKind.Custom) {
    documentName = (config as CustomDocumentRequirementConfig).name;
    documentDescription = (config as CustomDocumentRequirementConfig)
      .description;
  }

  return {
    documentName,
    documentDescription,
  };
};

export default getCustomDocInfo;
