import { IcoCopy16 } from '@onefootprint/icons';
import { CopyButton, Dialog } from '@onefootprint/ui';
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

const RegistrationDetails = ({
  registration: {
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
  },
  onClose,
}: RegistrationDetailsProps) => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'onboardings.registrations' });
  const statusT = useRegistrationStatusText();

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
                  <div className="flex items-center gap-1 justify-end max-w-[60%]">
                    <p className="text-body-3 truncate">{source}</p>
                    <CopyButton
                      ariaLabel={t('dialog.filing-details.source-aria-label')}
                      contentToCopy={source}
                      tooltip={{ position: 'left' }}
                    >
                      <IcoCopy16 />
                    </CopyButton>
                  </div>
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
