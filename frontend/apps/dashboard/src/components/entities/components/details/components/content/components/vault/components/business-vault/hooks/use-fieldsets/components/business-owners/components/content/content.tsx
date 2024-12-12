import { IcoInfo16 } from '@onefootprint/icons';
import type { PrivateBusinessOwner } from '@onefootprint/request-types/dashboard';
import type { EntityStatus } from '@onefootprint/types';
import { Badge } from '@onefootprint/ui';
import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import StatusBadge from 'src/components/status-badge';

export type ContentProps = {
  explanationMessage?: string;
  businessOwners: PrivateBusinessOwner[];
};

const BusinessOwnersField = ({ businessOwners, explanationMessage }: ContentProps) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.bos' });

  const getHintText = ({ ownershipStake: stake, kind, source }: PrivateBusinessOwner): string => {
    const isPrimary = kind === 'primary' && source !== 'tenant';
    if (isPrimary) {
      return stake ? t('hint.primary-with-stake', { stake }) : t('hint.primary-no-stake');
    }
    return stake ? t('hint.generic-stake', { stake }) : '';
  };

  return (
    <div className="flex flex-col gap-6">
      <ul className="grid gap-4" aria-label={t('list-title')}>
        {businessOwners.map((businessOwner, index) => {
          const isPrimary = businessOwner.kind === 'primary';

          return (
            <li className="flex justify-between" key={businessOwner.fpId || index}>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1">
                  <p className="text-body-3 text-tertiary">{t('label')}</p>
                  <div className="flex gap-1">
                    {isPrimary ? <Badge variant="neutral">{t('primary')}</Badge> : null}
                    {businessOwner.boStatus !== 'awaiting_kyc' ? (
                      <StatusBadge status={businessOwner.boStatus as EntityStatus} />
                    ) : (
                      <Badge variant="info">{t('status.awaiting-kyc')}</Badge>
                    )}
                  </div>
                  {businessOwner.fpId && <ViewProfileLink href={`/users/${businessOwner.fpId}`} />}
                </div>
                <p className="text-caption-2 text-secondary">{getHintText(businessOwner)}</p>
              </div>
              <p className="text-body-3 text-primary text-center h-6">{businessOwner.name}</p>
            </li>
          );
        })}
      </ul>
      {explanationMessage ? <OwnershipExplanation value={explanationMessage} /> : null}
    </div>
  );
};

const ViewProfileLink = ({ href }: { href: string }) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.bos' });

  return (
    <>
      <span>·</span>
      <p className="text-label-3 text-accent">
        <Link href={href}>{t('link')}</Link>
      </p>
    </>
  );
};

const OwnershipExplanation = ({ value }: { value: string }) => {
  const { t } = useTranslation('business-details', { keyPrefix: 'vault.bos.stake-explanation' });

  return (
    <div className="flex flex-col gap-3 bg-primary border border-solid border-tertiary rounded p-5">
      <div className="flex items-center gap-2">
        <IcoInfo16 />
        <p className="text-label-3">{t('title')}</p>
      </div>
      <p className="text-body-3 text-secondary">{value}</p>
    </div>
  );
};

export default BusinessOwnersField;
