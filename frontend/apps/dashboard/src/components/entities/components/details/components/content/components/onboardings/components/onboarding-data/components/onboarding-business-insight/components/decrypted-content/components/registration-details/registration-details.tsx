import { IcoArrowTopRight16 } from '@onefootprint/icons';
import { Dialog, LinkButton } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import { statusVariant } from '../../../../constants';
import type { FormattedRegistration } from '../../../../onboarding-business-insight.types';
import useRegistrationStatusText from '../../hooks/use-registration-status-text';
import LineItem from '../line-item';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-3">
    <p className="text-label-3 pb-1">{title}</p>
    {children}
  </div>
);

export type RegistrationDetailsProps = {
  registration: FormattedRegistration;
  onClose: () => void;
};

const RegistrationDetails = ({ registration, onClose }: RegistrationDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.registrations' });
  const statusT = useRegistrationStatusText();
  const {
    state,
    status,
    jurisdiction,
    subStatus,
    name,
    entityType,
    addresses,
    registeredAgent,
    registrationDate,
    fileNumber,
    source,
  } = registration;

  return (
    <Dialog onClose={onClose} open title={t('title')}>
      <fieldset className="flex flex-col justify-between rounded border border-solid border-tertiary">
        <header className="flex justify-between py-2 px-4 bg-secondary border-b border-solid border-tertiary rounded-t">
          <p className="text-label-3">{state}</p>
          {status && (
            <p className="text-label-3" color={statusVariant[status]}>
              {statusT(status)}
            </p>
          )}
        </header>
        <div className="flex flex-col gap-8 py-4 px-6">
          <Section title={t('dialog.status-details.title')}>
            <LineItem label={t('dialog.status-details.jurisdiction')} value={jurisdiction} />
            <LineItem label={t('dialog.status-details.sub-status')} value={subStatus} />
          </Section>
          <Section title={t('dialog.entity-details.title')}>
            <LineItem label={t('dialog.entity-details.name')} value={name} />
            <LineItem label={t('dialog.entity-details.entity-type')} value={entityType} />
          </Section>
          <Section title={t('dialog.addresses.title')}>
            {addresses.map(address => (
              <p className="text-body-3">{address}</p>
            ))}
          </Section>
          <Section title={t('dialog.people.title')}>
            <LineItem label={t('dialog.people.agent')} value={registeredAgent} />
          </Section>
          <Section title={t('dialog.filing-details.title')}>
            <LineItem label={t('dialog.filing-details.date')} value={registrationDate} />
            <LineItem label={t('dialog.filing-details.file-number')} value={fileNumber} />
            {source ? (
              <LineItem
                label={t('dialog.filing-details.source')}
                customValue={
                  <LinkButton href={source} iconComponent={IcoArrowTopRight16}>
                    {source}
                  </LinkButton>
                }
              />
            ) : (
              <LineItem label={t('dialog.filing-details.source')} value={source} />
            )}
          </Section>
        </div>
      </fieldset>
    </Dialog>
  );
};

export default RegistrationDetails;
