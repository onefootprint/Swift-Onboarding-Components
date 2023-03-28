import {
  DecryptDocumentResponse,
  DecryptIdDocumentResponse,
  DecryptTextResponse,
  IdDI,
  InvestorProfileDI,
  Vault,
} from '@onefootprint/types';
import kebabCase from 'lodash/kebabCase';

type DecryptResponse =
  | DecryptIdDocumentResponse
  | DecryptTextResponse
  | DecryptDocumentResponse;

export function isTextResponse(
  response: DecryptResponse,
): response is DecryptTextResponse {
  const hasInvestorProfile = Object.entries(InvestorProfileDI).some(
    ([, value]) => value in response,
  );
  const hasId = Object.entries(IdDI).some(([, value]) => value in response);
  return hasInvestorProfile || hasId;
}

export function isIdDocumentResponse(
  response: DecryptResponse,
): response is DecryptIdDocumentResponse {
  return (response as DecryptIdDocumentResponse).images !== undefined;
}

export function isDocumentResponse(
  response: DecryptResponse,
): response is DecryptDocumentResponse {
  return (response as DecryptDocumentResponse).content !== undefined;
}

export const groupResponseByKind = (responses: DecryptResponse[]) => {
  const result: {
    text: DecryptTextResponse;
    idDocuments: DecryptIdDocumentResponse[];
    documents: DecryptDocumentResponse[];
  } = {
    text: {},
    idDocuments: [],
    documents: [],
  };
  responses.forEach(response => {
    if (isDocumentResponse(response)) {
      result.documents.push(response);
    } else if (isTextResponse(response)) {
      result.text = response;
    } else if (isIdDocumentResponse(response)) {
      result.idDocuments.push(response);
    }
  });
  return result;
};

export const groupResponseKindsByVault = ({
  text,
  idDocuments,
  documents,
}: {
  text: DecryptTextResponse;
  idDocuments: DecryptIdDocumentResponse[];
  documents: DecryptDocumentResponse[];
}) => {
  const vault: Vault = {
    id: {},
    idDoc: {},
    investorProfile: {},
    document: {},
  };
  Object.entries(IdDI).forEach(([, attribute]) => {
    if (attribute in text) {
      vault.id[attribute] = text[attribute];
    }
  });
  Object.entries(InvestorProfileDI).forEach(([, attribute]) => {
    if (attribute in text) {
      vault.investorProfile[attribute] = text[attribute];
    }
  });
  documents.forEach(document => {
    vault.document[document.dataIdentifier] = {
      content: document.content,
      name: `${kebabCase(document.dataIdentifier)}.pdf`,
    };
  });
  idDocuments.forEach(document => {
    vault.idDoc[document.documentIdentifier] = document.images;
  });
  return vault;
};
