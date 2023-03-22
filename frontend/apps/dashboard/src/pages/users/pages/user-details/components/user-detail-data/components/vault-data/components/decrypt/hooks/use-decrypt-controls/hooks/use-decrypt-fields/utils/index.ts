import {
  DecryptIdDocumentResponse,
  DecryptTextResponse,
  IdDI,
  InvestorProfileDI,
  Vault,
} from '@onefootprint/types';

export function isTextResponse(
  response: DecryptIdDocumentResponse | DecryptTextResponse,
): response is DecryptTextResponse {
  const hasInvestorProfile = Object.entries(InvestorProfileDI).some(
    ([, value]) => value in response,
  );
  const hasId = Object.entries(IdDI).some(([, value]) => value in response);
  return hasInvestorProfile || hasId;
}

export function isIdDocumentResponse(
  response: DecryptIdDocumentResponse | DecryptTextResponse,
): response is DecryptIdDocumentResponse {
  return (response as DecryptIdDocumentResponse).images !== undefined;
}

export const groupResponseByKind = (
  responses: (DecryptIdDocumentResponse | DecryptTextResponse)[],
) => {
  const result: {
    text: DecryptTextResponse;
    idDocuments: DecryptIdDocumentResponse[];
  } = {
    text: {},
    idDocuments: [],
  };
  responses.forEach(response => {
    if (isTextResponse(response)) {
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
}: {
  text: DecryptTextResponse;
  idDocuments: DecryptIdDocumentResponse[];
}) => {
  const vault: Vault = {
    id: {},
    idDoc: {},
    investorProfile: {},
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
  idDocuments.forEach(document => {
    vault.idDoc[document.documentIdentifier] = document.images;
  });
  return vault;
};
