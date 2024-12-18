import type { Option } from './collected-information.types';
import DisplayValue from './components/display-value';
import Label from './components/label';
import useInfoLabel from './hooks/use-info-label';

type CollectedInformationProps = {
  title?: string;
  subtitle?: string;
  options?: Option;
};

const CollectedInformation = ({ title, subtitle, options }: CollectedInformationProps) => {
  const getLabel = useInfoLabel();

  return (
    <div className="flex flex-col gap-2">
      {title && <h4 className="text-label-2 text-secondary">{title}</h4>}
      {options ? (
        <ul className="flex flex-col items-center gap-1">
          {Object.entries(options).map(([name, value]) => {
            if (value == null || value === undefined) return null;
            const typedName = name as keyof Option;
            const typedValue = value as Option[keyof Option];
            const label = getLabel(typedName);

            return (
              <li key={name} aria-label={label} className="flex flex-row justify-start w-full gap-3">
                <DisplayValue name={typedName} value={typedValue} />
                <Label name={typedName} value={typedValue} />
              </li>
            );
          })}
        </ul>
      ) : null}
      {subtitle && <p className="text-body-2 text-secondary">{subtitle}</p>}
    </div>
  );
};

export default CollectedInformation;
