import { requestWithoutCaseConverter } from '@onefootprint/request';
import type { HostedBusinessOwner } from '@onefootprint/request-types';
import { IdDI } from '@onefootprint/types';
import { AUTH_HEADER } from '@onefootprint/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import partition from 'lodash/partition';
import { QUERY_KEY } from '../use-business-owners/use-business-owners';

export type BusinessOwnerData = {
  [IdDI.firstName]: string;
  [IdDI.middleName]?: string;
  [IdDI.lastName]: string;
  [IdDI.email]: string;
  [IdDI.phoneNumber]: string;
};

type UpdateOrCreateBoOperation = { uuid: string; data: Partial<BusinessOwnerData>; ownershipStake?: number };

type Request = {
  authToken: string;
  currentBos: HostedBusinessOwner[];
  updateOrCreateOperations: UpdateOrCreateBoOperation[];
  deleteOperations: string[];
};

type Response = HostedBusinessOwner[];

export const patchBusinessOwnersRequest = async ({
  authToken,
  currentBos,
  updateOrCreateOperations,
  deleteOperations,
}: Request) => {
  /** Get business owner details by id */
  const existingBosByUuid = Object.fromEntries(currentBos.map(({ uuid, ...props }) => [uuid, props]));

  /** Split updateOrCreateOperations into create and update operations */
  const [updateOperations, createOperations] = partition(updateOrCreateOperations, op => !!existingBosByUuid[op.uuid]);

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

    const authedUserDataChangeOperations = updateOperationsForAuthedUser
      .map(({ data, ...operation }) => ({
        ...operation,
        data: Object.fromEntries(Object.entries(data).filter(([di]) => di !== IdDI.email && di !== IdDI.phoneNumber)),
      }))
      .filter(operation =>
        Object.entries(operation.data).some(
          // @ts-ignore
          ([di, value]) => value && existingBosByUuid[operation.uuid]?.decryptedData?.[di] !== value,
        ),
      );

    if (authedUserDataChangeOperations.length === 1) {
      try {
        await requestWithoutCaseConverter<Response>({
          method: 'PATCH',
          headers: { [AUTH_HEADER]: authToken },
          url: '/hosted/user/vault',
          data: authedUserDataChangeOperations[0].data,
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
    ...deleteOperations.map(uuid => ({
      op: 'delete',
      uuid,
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

const useBusinessOwnersPatch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patchBusinessOwnersRequest,
    onSuccess: () => {
      queryClient.refetchQueries({ queryKey: [QUERY_KEY] });
    },
  });
};

export default useBusinessOwnersPatch;
