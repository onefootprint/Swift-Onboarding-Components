import { Checkbox, Divider, Drawer, Stack, Text } from '@onefootprint/ui';
import { useForm, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type DrawerFilterProps = {
  defaultValues?: string[];
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values?: string) => void;
};

const options = ['all', 'kyc', 'kyb', 'auth', 'document'];

const DrawerFilter = ({ isOpen, onClose, onSubmit, defaultValues }: DrawerFilterProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'table.filters.drawer' });

  const handleSubmit = (data: FilterFormValues) => {
    if (data.kinds.includes('all')) {
      onSubmit();
    } else {
      onSubmit(data.kinds.join(','));
    }
  };

  return (
    <Drawer
      title={t('title')}
      open={isOpen}
      onClose={onClose}
      primaryButton={{ label: t('apply-filters'), onClick: () => document.forms[0].requestSubmit() }}
      linkButton={{ label: t('clear-all'), onClick: () => onSubmit() }}
    >
      <FilterForm onSubmit={handleSubmit} defaultValues={defaultValues} />
    </Drawer>
  );
};

type FilterFormValues = {
  kinds: string[];
};

type FilterFormProps = {
  onSubmit: (values: FilterFormValues) => void;
  defaultValues?: string[];
};

const FilterForm = ({ onSubmit, defaultValues }: FilterFormProps) => {
  const { t } = useTranslation('playbooks', { keyPrefix: 'table.filters.drawer' });
  const { handleSubmit, setValue, control } = useForm<FilterFormValues>({
    defaultValues: {
      kinds: defaultValues?.length ? defaultValues : options,
    },
  });
  const selectedKinds = useWatch({
    control,
    name: 'kinds',
  });

  const onFormSubmit = handleSubmit(onSubmit);

  const handleKindChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = event.target;
    const optionsExcludingAll = options.filter(kind => kind !== 'all');

    if (value === 'all' && checked) {
      setValue('kinds', options);
    } else if (value === 'all' && !checked) {
      setValue('kinds', []);
    } else {
      const isAllSelected = selectedKinds.includes('all');
      if (isAllSelected && !checked) {
        setValue('kinds', [value]);
      } else if (checked) {
        const newOptions = [...selectedKinds, value];
        if (newOptions.length === optionsExcludingAll.length) {
          setValue('kinds', options);
        } else {
          setValue('kinds', newOptions);
        }
      } else {
        setValue(
          'kinds',
          selectedKinds.filter(kind => kind !== value),
        );
      }
    }
  };

  return (
    <form onSubmit={onFormSubmit}>
      <Stack direction="column" gap={3}>
        <Text variant="label-3">{t('playbook-type')}</Text>
        <Checkbox label={t('all')} value="all" checked={selectedKinds.includes('all')} onChange={handleKindChange} />
        <Divider variant="secondary" marginBlock={4} />
        <Checkbox label={t('kyc')} value="kyc" checked={selectedKinds.includes('kyc')} onChange={handleKindChange} />
        <Checkbox label={t('kyb')} value="kyb" checked={selectedKinds.includes('kyb')} onChange={handleKindChange} />
        <Checkbox label={t('auth')} value="auth" checked={selectedKinds.includes('auth')} onChange={handleKindChange} />
        <Checkbox
          label={t('document')}
          value="document"
          checked={selectedKinds.includes('document')}
          onChange={handleKindChange}
        />
      </Stack>
    </form>
  );
};

export default DrawerFilter;
