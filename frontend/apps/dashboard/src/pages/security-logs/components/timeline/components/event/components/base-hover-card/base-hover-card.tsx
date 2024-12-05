import type { Icon } from '@onefootprint/icons';
import * as HoverCard from '@radix-ui/react-hover-card';
import { motion } from 'framer-motion';

type BaseHoverCardProps = {
  textTrigger: string;
  children: React.ReactNode;
  titleText?: string;
  titleIcon?: Icon;
};

const BaseHoverCard = ({ textTrigger, children, titleText, titleIcon: TitleIcon }: BaseHoverCardProps) => {
  return (
    <HoverCard.Root openDelay={0} closeDelay={0}>
      <HoverCard.Trigger className="relative inline-block cursor-default">
        <span className="absolute inset-[-8px]" />
        <span className="relative z-10 underline text-label-3">{textTrigger}</span>
      </HoverCard.Trigger>

      <HoverCard.Portal>
        <HoverCard.Content
          side="bottom"
          sideOffset={4}
          align="start"
          collisionPadding={8}
          avoidCollisions={true}
          asChild
        >
          <motion.div
            className="z-10 flex flex-col gap-4 p-5 border border-solid rounded shadow-md border-tertiary bg-primary border-spacing-1 max-w-[458px] min-w-[380px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.1, ease: 'easeOut' }}
            style={{ transformOrigin: 'var(--radix-hover-card-content-transform-origin)' }}
          >
            <div className="flex items-center gap-1">
              {TitleIcon && <TitleIcon />}
              {titleText && <span className="text-label-3 whitespace-nowrap">{titleText}</span>}
            </div>
            {children}
          </motion.div>
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  );
};

export default BaseHoverCard;
