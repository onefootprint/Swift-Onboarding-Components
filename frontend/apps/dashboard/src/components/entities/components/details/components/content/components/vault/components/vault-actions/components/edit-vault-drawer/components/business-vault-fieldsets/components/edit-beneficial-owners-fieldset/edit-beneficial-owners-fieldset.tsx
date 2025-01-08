import type { WithEntityProps } from '@/entities/components/details/components/with-entity';
import { IcoUsers16 } from '@onefootprint/icons';
import type { PrivateBusinessOwner } from '@onefootprint/request-types/dashboard';
import type { DataIdentifier } from '@onefootprint/types';
import { Divider } from '@onefootprint/ui';
import React from 'react';
import { useTranslation } from 'react-i18next';
import EditField from '../../../edit-field';

type EditBeneficialOwnersFieldsetProps = WithEntityProps & {
  beneficialOwners: PrivateBusinessOwner[];
};

const EditBeneficialOwnersFieldset = ({ entity, beneficialOwners }: EditBeneficialOwnersFieldsetProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header-default.actions.edit-vault-drawer.fieldsets.beneficial-owners',
  });

  return (
    <fieldset
      className="flex flex-col justify-between h-full w-full border border-solid border-tertiary rounded"
      aria-label={t('title')}
    >
      <header className="flex justify-between py-2 px-4 bg-secondary border-b border-solid border-tertiary rounded-t">
        <div className="flex items-center gap-2">
          <IcoUsers16 />
          <h2 className="text-label-2">{t('title')}</h2>
        </div>
      </header>
      <div className="flex flex-col gap-3 p-4 flex-1">
        {beneficialOwners.map(({ id, name, ownershipStake, ownershipStakeDi }, index) => (
          <React.Fragment key={ownershipStakeDi}>
            <EditField
              // Manually creating a DI for the beneficial owner name so we can use EditField here
              di={`business.beneficial_owners.${id}.business_owner` as DataIdentifier}
              entity={entity}
              beneficialOwnerValue={name}
            />
            <EditField di={ownershipStakeDi as DataIdentifier} entity={entity} beneficialOwnerValue={ownershipStake} />
            {index < beneficialOwners.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </div>
    </fieldset>
  );
};

export default EditBeneficialOwnersFieldset;
