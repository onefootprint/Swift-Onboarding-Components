import { requestWithoutCaseConverter } from '@onefootprint/request';
import { IdDI } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import partition from 'lodash/partition';
import type { VaultData } from '../../client/types.gen';
import type { HostedBusinessOwner } from '../use-business-owners';

type BusinessOwnerData = {
  [IdDI.firstName]: string;
  [IdDI.middleName]?: string;
  [IdDI.lastName]: string;
  [IdDI.email]: string;
  [IdDI.phoneNumber]: string;
};
type CreateBoOperation = { op: 'create'; uuid: string; data: BusinessOwnerData; ownership_stake: number };
type UpdateBoOperation = { op: 'update'; uuid: string; data: Partial<BusinessOwnerData>; ownership_stake: number };
type DeleteBoOperation = { op: 'delete'; uuid: string };
type BusinessOwnerPatchOperation = CreateBoOperation | UpdateBoOperation | DeleteBoOperation;

type Request = {
  authToken: string;
  currentBos: HostedBusinessOwner[];
  operations: BusinessOwnerPatchOperation[];
};

type Response = HostedBusinessOwner[];

export const patchBusinessOwnersRequest = async ({ authToken, currentBos, operations }: Request) => {
  /** Get business owner details by id */
  const boDetailsByUuid = Object.fromEntries(currentBos.map(({ uuid, ...props }) => [uuid, props]));

  /** Split operations into update and non-update operations */
  const [updateOperations, nonUpdateOperations] = partition(operations, op => op.op === 'update');

  /** Filter out updates for immutable owners */
  const mutableUpdates = updateOperations.filter(op => boDetailsByUuid[op.uuid]?.isMutable);

  /** Split update operations into those with and without linked users */
  const [updateOperationsWithLinkedUser, updateOperationsWithoutLinkedUser] = partition(
    mutableUpdates,
    op => boDetailsByUuid[op.uuid]?.hasLinkedUser,
  );

  /** Update linked users, if necessary */
  if (updateOperationsWithLinkedUser.length > 0) {
    const linkedUserDataChangeOperations = updateOperationsWithLinkedUser.filter(
      operation =>
        operation.data &&
        Object.entries(operation.data).some(
          ([di, value]) => value && boDetailsByUuid[operation.uuid]?.decryptedData?.[di as keyof VaultData] !== value,
        ),
    );

    if (linkedUserDataChangeOperations.length > 1) {
      throw new Error('Cannot update multiple linked users at once');
    }

    if (linkedUserDataChangeOperations.length === 1) {
      try {
        await requestWithoutCaseConverter<Response>({
          method: 'PATCH',
          headers: { [AUTH_HEADER]: authToken },
          url: '/hosted/user/vault',
          data: linkedUserDataChangeOperations[0].data,
        });
      } catch (error) {
        console.error('Failed to update linked user:', error);
        throw error;
      }
    }
  }

  /** Update non-linked users */
  const bulkPayload = [
    ...nonUpdateOperations,
    ...updateOperationsWithoutLinkedUser,
    ...updateOperationsWithLinkedUser
      .filter(operation => boDetailsByUuid[operation.uuid]?.ownershipStake !== operation.ownership_stake)
      .map(operation => ({
        op: 'update',
        uuid: operation.uuid,
        ownership_stake: operation.ownership_stake,
      })),
  ];

  if (bulkPayload.length === 0) {
    return [];
  }

  const response = await requestWithoutCaseConverter<Response>({
    method: 'PATCH',
    headers: { [AUTH_HEADER]: authToken },
    url: '/hosted/business/owners',
    data: bulkPayload,
  });

  return response.data;
};

const useBusinessOwnersPatch = () =>
  useMutation({
    mutationFn: patchBusinessOwnersRequest,
  });

export default useBusinessOwnersPatch;
