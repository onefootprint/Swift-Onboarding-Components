import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { useIdentifyMachine } from '../../state';
import { IdentifyVariant } from '../../state/types';
import DashedLine from '../dashed-line';
import Content from './components/content';
import SandboxInput from './components/sandbox-input';
import sandboxIdEditRules from './utils/editable-sandbox-rules';

const voidObj: Record<string, never> = {};

const SandboxFooter = (): JSX.Element | null => {
  const { t } = useTranslation('identify');
  const [state, send] = useIdentifyMachine();
  const { overallOutcome } = state.context;
  const [sandboxId, setSandboxId] = useState<string>(state.context.sandboxId || '');
  const { isLive, bootstrapData, variant } = state.context;

  if (isLive) {
    // No sandbox footer in live
    return null;
  }

  if (sandboxIdEditRules(state.value, bootstrapData || voidObj) && variant !== IdentifyVariant.verify) {
    return (
      <>
        <DashedLine variant="secondary" />
        <SandboxInput
          label={t('sandbox.label')}
          placeholder={t('sandbox.placeholder')}
          value={sandboxId}
          setValue={value => {
            setSandboxId(value);
            send({
              type: 'sandboxIdChanged',
              payload: { sandboxId: value },
            });
          }}
          texts={{
            copy: t('sandbox.button.copy'),
            copyConfirmation: t('sandbox.button.copy-confirmation'),
            description: t('sandbox.description'),
            edit: t('sandbox.button.edit'),
            reset: t('sandbox.button.reset'),
            save: t('sandbox.button.save'),
          }}
        />
      </>
    );
  }
  return <Content label={t('sandbox.label')} sandboxId={sandboxId} overallOutcome={overallOutcome} />;
};

export default SandboxFooter;
