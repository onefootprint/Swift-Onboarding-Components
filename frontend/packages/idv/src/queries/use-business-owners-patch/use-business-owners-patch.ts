import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { HostedBusinessOwner } from '@onefootprint/services';
import { IdDI } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation } from '@tanstack/react-query';
import partition from 'lodash/partition';

export type BusinessOwnerData = {
  [IdDI.firstName]: string;
  [IdDI.middleName]?: string;
  [IdDI.lastName]: string;
  [IdDI.email]: string;
  [IdDI.phoneNumber]: string;
};

type CreateBoOperation = { uuid: string; data: BusinessOwnerData; ownershipStake: number };

type UpdateBoOperation = { uuid: string; data: Partial<BusinessOwnerData>; ownershipStake: number };

type BusinessOwnerPatchOperation = CreateBoOperation | UpdateBoOperation;

type Request = {
  authToken: string;
  currentBos: HostedBusinessOwner[];
  operations: BusinessOwnerPatchOperation[];
};

type Response = HostedBusinessOwner[];

export const patchBusinessOwnersRequest = async ({ authToken, currentBos, operations }: Request) => {
  /** Get business owner details by id */
  const existingBosByUuid = Object.fromEntries(currentBos.map(({ uuid, ...props }) => [uuid, props]));

  /** Split operations into create and update operations */
  const [updateOperations, createOperations] = partition(operations, op => !!existingBosByUuid[op.uuid]);

  /** Split update operations into those with and without linked users */
  const [updateOperationsForAuthedUser, updateOperationsForOtherUsers] = partition(
    updateOperations,
    op => existingBosByUuid[op.uuid]?.isAuthedUser,
  );

  /** Update current user's vault info, if necessary */
  if (updateOperationsForAuthedUser.length > 0) {
    if (updateOperationsForAuthedUser.length > 1) {
      throw new Error('Cannot be more than one authed user to update');
    }

    const linkedUserDataChangeOperations = updateOperationsForAuthedUser.filter(operation =>
      Object.entries(operation.data).some(
        ([di, value]) => value && existingBosByUuid[operation.uuid]?.decryptedData?.[di] !== value,
      ),
    );

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
    ...createOperations.map(({ ownershipStake, ...restOfOp }) => ({
      op: 'create',
      ...restOfOp,
      ownership_stake: ownershipStake,
    })),
    ...updateOperationsForOtherUsers.map(({ ownershipStake, ...restOfOp }) => ({
      op: 'update',
      ...restOfOp,
      ownership_stake: ownershipStake,
    })),
    ...updateOperationsForAuthedUser
      .filter(operation => existingBosByUuid[operation.uuid]?.ownershipStake !== operation.ownershipStake)
      .map(operation => ({
        op: 'update',
        uuid: operation.uuid,
        ownership_stake: operation.ownershipStake,
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

export type { BusinessOwnerPatchOperation };

export default useBusinessOwnersPatch;
