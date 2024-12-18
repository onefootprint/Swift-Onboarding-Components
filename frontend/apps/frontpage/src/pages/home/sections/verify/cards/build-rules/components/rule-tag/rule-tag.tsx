export type RuleTagProps = {
  className?: string;
  signal: string;
  op: 'is' | 'is not';
  list?: string;
};

const RuleTag = ({ signal, op, list, className }: RuleTagProps) => (
  <div
    className={`${className} bg-primary border border-solid border-tertiary px-3 rounded-full flex flex-row items-center gap-3`}
  >
    <p className="text-label-3">{signal}</p>
    <p className="text-label-3">{op}</p>
    {list ? (
      <>
        <p className="text-body-3 text-tertiary">in</p>
        <p className="text-body-3">{list}</p>
      </>
    ) : (
      <p className="text-body-3">triggered</p>
    )}
  </div>
);

export default RuleTag;
