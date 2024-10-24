import type { WithEntityProps } from '@/entity/components/with-entity';
import useEntityVault from 'src/components/entities/hooks/use-entity-vault';
import Fieldset from '../../../fieldset';
import RiskSignalsOverview from '../../../risk-signals-overview';
import useFieldsets from '../../hooks/use-fieldsets';
import Content from './components/content';

export type DocumentFieldsetProps = WithEntityProps;

const DocumentFieldset = ({ entity }: DocumentFieldsetProps) => {
  const { documents: documentFieldset } = useFieldsets();
  const { data: vaultWithTransforms } = useEntityVault(entity.id, entity);
  const vault = vaultWithTransforms?.vault;

  return vault ? (
    <Fieldset
      fields={documentFieldset.fields}
      iconComponent={documentFieldset.iconComponent}
      title={documentFieldset.title}
      footer={<RiskSignalsOverview type="document" />}
    >
      <Content entity={entity} />
    </Fieldset>
  ) : null;
};

export default DocumentFieldset;
