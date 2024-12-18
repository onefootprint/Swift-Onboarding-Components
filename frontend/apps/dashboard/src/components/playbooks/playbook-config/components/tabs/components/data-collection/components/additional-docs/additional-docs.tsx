import { IcoCode216, IcoFileText16, IcoFlag16, IcoWriting16 } from '@onefootprint/icons';
import type { DocumentRequestConfig, DocumentUploadSettings } from '@onefootprint/request-types/dashboard';
import { Divider, LinkButton, Popover } from '@onefootprint/ui';
import { cx } from 'class-variance-authority';
import { useTranslation } from 'react-i18next';

type AdditionalDocsProps = {
  docs: DocumentRequestConfig[];
  variant?: 'sectioned' | 'default';
};

const AdditionalDocs = ({ docs, variant = 'default' }: AdditionalDocsProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection.additional-docs' });
  const list = docs.map(doc => {
    if (doc.kind === 'proof_of_ssn') {
      return {
        label: t('possn.title'),
        identifier: undefined,
        description: t('possn.description'),
        requiresHumanReview: doc.data.requiresHumanReview,
        uploadSettings: undefined,
      };
    }
    if (doc.kind === 'proof_of_address') {
      return {
        label: t('poa.title'),
        identifier: undefined,
        description: t('poa.description'),
        requiresHumanReview: doc.data.requiresHumanReview,
        uploadSettings: undefined,
      };
    }
    if (doc.kind === 'custom') {
      return {
        label: doc.data.name,
        identifier: doc.data.identifier,
        description: doc.data.description,
        requiresHumanReview: doc.data.requiresHumanReview,
        uploadSettings: doc.data.uploadSettings,
      };
    }
    throw new Error('Unknown document type');
  });

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-label-2">{t('title')}</h4>
      {variant === 'sectioned' && (
        <>
          <Divider variant="secondary" />
          <p className="text-label-2 text-primary">{t('docs-to-collect')}</p>
        </>
      )}
      <ul className="flex flex-col gap-2 pl-2">
        {list.map(doc => (
          <DocItem
            uploadSettings={doc.uploadSettings}
            description={doc.description}
            identifier={doc.identifier}
            key={doc.label}
            label={doc.label}
            requiresHumanReview={doc.requiresHumanReview}
          />
        ))}
      </ul>
    </div>
  );
};

type DocItemProps = {
  uploadSettings?: DocumentUploadSettings;
  description?: string;
  identifier?: string;
  label: string;
  requiresHumanReview: boolean;
};

const PopoverContent = ({
  identifier,
  description,
  requiresHumanReview,
  uploadSettings,
}: Omit<DocItemProps, 'label'>) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection.additional-docs' });

  const contentItems = [
    { condition: !!identifier, icon: <IcoCode216 />, text: identifier, variant: 'snippet-2' },
    { condition: !!description, icon: <IcoWriting16 />, text: description, variant: 'body-3' },
    { condition: requiresHumanReview, icon: <IcoFlag16 />, text: t('requires-manual-review'), variant: 'body-3' },
    {
      condition: !!uploadSettings,
      icon: <IcoFileText16 />,
      text:
        uploadSettings === 'prefer_upload'
          ? t('collection-method.prefer-upload')
          : t('collection-method.prefer-capture'),
      variant: 'body-3',
    },
  ];

  return (
    <div className="flex flex-col gap-2 p-3">
      {contentItems.map(
        ({ condition, icon, text, variant }) =>
          condition && (
            <div key={text} className="flex items-center w-full gap-2">
              {icon}
              <p
                className={cx('text-secondary', {
                  'text-body-3': variant === 'body-3',
                  'text-snippet-1 text-secondary': variant === 'snippet-2',
                })}
              >
                {text}
              </p>
            </div>
          ),
      )}
    </div>
  );
};

const DocItem = ({ label, identifier, description, requiresHumanReview, uploadSettings }: DocItemProps) => {
  const { t } = useTranslation('playbook-details', { keyPrefix: 'data-collection.additional-docs' });
  return (
    <div className="flex flex-row items-center gap-1">
      <p className="text-body-2 text-secondary">{label}</p>
      {identifier || description || requiresHumanReview ? (
        <>
          <p className="text-body-2 text-secondary">⋅</p>
          <Popover.Root>
            <Popover.Trigger>
              <LinkButton variant="label-2">{t('more-details')}</LinkButton>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content asChild>
                <PopoverContent
                  uploadSettings={uploadSettings}
                  identifier={identifier}
                  description={description}
                  requiresHumanReview={requiresHumanReview}
                />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </>
      ) : null}
    </div>
  );
};

export default AdditionalDocs;
