import { LinkButton } from '@onefootprint/ui';

type ShowMoreButtonProps = {
  children: string;
  showAllCta: boolean;
  onClick: () => void;
  count: string;
};

const ShowMoreButton = ({ children, showAllCta, onClick, count }: ShowMoreButtonProps) => {
  return (
    <div className="flex justify-center gap-2 py-3 border-t border-dashed border-tertiary">
      {!showAllCta ? (
        <>
          <p className="text-center text-tertiary text-body-3">{count}</p>
          <p className="text-center text-tertiary text-label-3">⋅</p>
        </>
      ) : null}
      <LinkButton onClick={onClick} variant="label-3">
        {children}
      </LinkButton>
    </div>
  );
};

export default ShowMoreButton;
