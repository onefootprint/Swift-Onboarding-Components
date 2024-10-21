import useEntityId from '@/entity/hooks/use-entity-id';
import { IcoTrash16 } from '@onefootprint/icons';
import { EntityLabel } from '@onefootprint/types';
import { Dropdown } from '@onefootprint/ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLabel from 'src/hooks/use-label';
import useEditLabel from './hooks/use-edit-label';
import useLabelText from './hooks/use-label-text';
import Trigger from './trigger';

const FraudLabel = () => {
  const { t } = useTranslation('entity-details', { keyPrefix: 'header-default.fraud-label' });
  const labelT = useLabelText();
  const entityId = useEntityId();
  const { data: label, isPending, error } = useLabel(entityId);
  const [isOpen, setIsOpen] = useState(false);
  const editLabelMutation = useEditLabel();

  const toggleDropdown = () => {
    setIsOpen(prev => !prev);
  };

  const handleEditLabel = (label: EntityLabel | null) => {
    editLabelMutation.mutate(
      { id: entityId, kind: label },
      {
        onSuccess: () => {
          setIsOpen(false);
        },
      },
    );
  };

  if (error || isPending) return null;

  return (
    <Dropdown.Root open={isOpen} onOpenChange={toggleDropdown}>
      <Trigger value={label} />
      <Dropdown.Content align={label ? 'end' : 'start'} sideOffset={4}>
        <Dropdown.Group>
          {Object.values(EntityLabel).map(labelOption => (
            <Dropdown.Item
              key={labelOption}
              onClick={() => handleEditLabel(labelOption)}
              checked={labelOption === label}
            >
              {labelT(labelOption)}
            </Dropdown.Item>
          ))}
        </Dropdown.Group>
        {label && (
          <>
            <Dropdown.Divider />
            <Dropdown.Group>
              <Dropdown.Item onClick={() => handleEditLabel(null)} variant="destructive" iconLeft={IcoTrash16}>
                {t('labels.remove')}
              </Dropdown.Item>
            </Dropdown.Group>
          </>
        )}
      </Dropdown.Content>
    </Dropdown.Root>
  );
};

export default FraudLabel;
