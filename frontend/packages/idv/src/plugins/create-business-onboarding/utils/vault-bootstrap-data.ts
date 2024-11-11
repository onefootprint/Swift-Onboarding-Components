import {
  getHostedBusinessOwners,
  patchHostedBusinessOwners,
  patchHostedBusinessVault,
  patchHostedUserVault,
} from '@onefootprint/axios';
import { uuidv4 } from '@onefootprint/dev-tools';
import type {
  HostedBusinessOwner,
  ModernRawBusinessDataRequest,
  ModernRawUserDataRequest,
} from '@onefootprint/request-types';

import type { BootstrapBusinessData, BootstrapUserData } from '../../../types';

const vaultBootstrapData = async (
  {
    bootstrapUserData,
    bootstrapBusinessData,
  }: {
    bootstrapUserData: BootstrapUserData;
    bootstrapBusinessData: BootstrapBusinessData;
  },
  options: { authToken: string },
) => {
  const businessPayload = getBusinessPayload(bootstrapBusinessData);
  const userPayload = getUserPayload(bootstrapUserData);
  const hasBusinessBootstrapData = Object.keys(businessPayload).length > 0;
  const hasUserBoostrapData = Object.keys(userPayload).length > 0;

  if (!hasBusinessBootstrapData && !hasUserBoostrapData) {
    return;
  }

  if (hasBusinessBootstrapData) {
    await patchHostedBusinessVault({
      headers: { 'X-Fp-Authorization': options.authToken },
      body: businessPayload,
    });
  }

  if (hasUserBoostrapData) {
    await patchHostedUserVault({
      headers: { 'X-Fp-Authorization': options.authToken },
      body: userPayload,
    });
  }

  const { data: businessOwners } = await getHostedBusinessOwners({
    headers: { 'X-Fp-Authorization': options.authToken },
  });
  if (!businessOwners?.length) {
    throw new Error('No business owners found');
  }
  const [primaryBo] = businessOwners;
  const primaryBoPayload = getPrimaryBoPayload(primaryBo, bootstrapBusinessData);
  const secondaryBosPayload = getSecondaryBos(bootstrapBusinessData);

  if (primaryBoPayload || secondaryBosPayload?.length) {
    const payload = [];
    if (primaryBoPayload) {
      payload.push(primaryBoPayload);
    }
    if (secondaryBosPayload?.length) {
      payload.push(...secondaryBosPayload);
    }

    await patchHostedBusinessOwners({
      headers: { 'X-Fp-Authorization': options.authToken },
      // @ts-ignore backend types are wrong
      body: payload,
    });
  }
};

const getPrimaryBoPayload = (primaryBo: HostedBusinessOwner, businessData: BootstrapBusinessData) => {
  if (businessData['business.primary_owner_stake']?.value) {
    return {
      op: 'update',
      uuid: primaryBo.uuid,
      data: {},
      ownership_stake: businessData['business.primary_owner_stake'].value,
    };
  }
  return null;
};

const getSecondaryBos = (businessData: BootstrapBusinessData) => {
  const secondaryOwners = businessData['business.secondary_owners']?.value;
  if (!secondaryOwners) {
    return null;
  }
  return secondaryOwners.map(({ first_name, last_name, email, phone_number, ownership_stake }) => ({
    op: 'create',
    uuid: uuidv4(),
    data: {
      'id.first_name': first_name,
      'id.last_name': last_name,
      'id.email': email,
      'id.phone_number': phone_number,
    },
    ownership_stake,
  }));
};

const getBusinessPayload = (businessData: BootstrapBusinessData) => {
  const allowedKeys = [
    'business.address_line1',
    'business.address_line2',
    'business.city',
    'business.corporation_type',
    'business.country',
    'business.zip',
    'business.dba',
    'business.formation_date',
    'business.formation_state',
    'business.name',
    'business.phone_number',
    'business.state',
    'business.tin',
    'business.website',
  ];

  return Object.fromEntries(
    Object.entries(businessData)
      .map(([key, { value }]) => [key, String(value)])
      .filter(([key]) => allowedKeys.includes(key as keyof ModernRawBusinessDataRequest)),
  );
};

const getUserPayload = (userData: BootstrapUserData) => {
  const allowedKeys = ['id.first_name', 'id.last_name'];

  return Object.fromEntries(
    Object.entries(userData)
      .map(([key, { value }]) => [key, String(value)])
      .filter(([key]) => allowedKeys.includes(key as keyof ModernRawUserDataRequest)),
  );
};

export default vaultBootstrapData;
