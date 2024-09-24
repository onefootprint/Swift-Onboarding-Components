import { EDIT_VAULT_FORM_ID } from '@/entity/constants';
import { EntityKind, type VaultValue } from '@onefootprint/types';
import { Button, Drawer, InlineAlert, Stack } from '@onefootprint/ui';
import { useTranslation } from 'react-i18next';
import styled, { css } from 'styled-components';
import EditForm from '../../../edit-form';
import useDecryptControls from '../../hooks/use-decrypt-controls';
import useEditControls from '../../hooks/use-edit-controls';

import useEntityVault from '@/entities/hooks/use-entity-vault';
import type { WithEntityProps } from '@/entity/components/with-entity';
import convertFormData from '../../../edit-form/utils/convert-form-data';
import PersonVaultFieldsets from './components/person-vault-fieldsets';

type DetailDrawerProps = WithEntityProps & {
  open: boolean;
  onClose: () => void;
};

const DetailDrawer = ({ entity, open, onClose }: DetailDrawerProps) => {
  const { t } = useTranslation('entity-details', {
    keyPrefix: 'header.actions.edit-vault-drawer',
  });
  const decryptControls = useDecryptControls();
  const editControls = useEditControls();
  const vaultWithTransforms = useEntityVault(entity.id, entity);
  const isPersonVault = entity.kind === EntityKind.person;

  const handleBeforeEditSubmit = (flattenedFormData: Record<string, VaultValue>) => {
    const previousData = vaultWithTransforms.data?.vault;
    const convertedData = convertFormData(flattenedFormData, previousData); // TODO: move this and EditForm closer
    editControls.submitFields(convertedData);
    editControls.saveEdit(entity.id, convertedData, {
      onSuccess: vaultWithTransforms.update,
    });
  };

  return (
    <EditForm onSubmit={handleBeforeEditSubmit}>
      <Drawer open={open} onClose={onClose} title={isPersonVault ? t('user-title') : t('business-title')}>
        <Stack direction="column" gap={7}>
          <InlineAlert
            variant="info"
            cta={{
              label: t('decrypt-alert.cta'),
              onClick: decryptControls.submitAllFields,
            }}
          >
            {t('decrypt-alert.text')}
          </InlineAlert>
          {isPersonVault && <PersonVaultFieldsets entity={entity} />}
        </Stack>
        <Footer justify="space-between" align="center" tag="footer">
          <Stack direction="row" gap={3}>
            <Button onClick={editControls.cancel} variant="secondary">
              {t('cancel')}
            </Button>
            <Button form={EDIT_VAULT_FORM_ID} type="submit" loading={!!editControls.isPending}>
              {t('cta')}
            </Button>
          </Stack>
        </Footer>
      </Drawer>
    </EditForm>
  );
};

const Footer = styled(Stack)`
  ${({ theme }) => css`
    bottom: 0;
    z-index: ${theme.zIndex.drawer};
    border-top: ${theme.borderWidth[1]} solid ${theme.borderColor.tertiary};
    padding: ${theme.spacing[4]} ${theme.spacing[7]};
    height: 56px;
  `}
`;

export default DetailDrawer;
