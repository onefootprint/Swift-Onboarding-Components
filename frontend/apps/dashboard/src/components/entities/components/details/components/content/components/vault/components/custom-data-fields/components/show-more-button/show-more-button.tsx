import { LinkButton } from '@onefootprint/ui';

type ShowMoreButtonProps = {
  children: string;
  isVisible: boolean;
  showingAll: boolean;
  onClick: () => void;
  count: string;
};

const ShowMoreButton = ({ children, isVisible, showingAll, onClick, count }: ShowMoreButtonProps) => {
  return (
    isVisible && (
      <div className="flex justify-center gap-2 py-3 border-t border-dashed border-tertiary">
        {!showingAll ? (
          <>
            <p className="text-center text-tertiary text-body-3">{count}</p>
            <p className="text-center text-tertiary text-label-3">⋅</p>
          </>
        ) : null}
        <LinkButton onClick={onClick} variant="label-3">
          {children}
        </LinkButton>
      </div>
    )
  );
};

export default ShowMoreButton;
