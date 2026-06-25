import Link from 'next/link';
import type { ReactNode } from 'react';

type SiteButtonVariant = 'primary' | 'secondary';
type SiteButtonSize = 'md' | 'lg';

type SiteButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: SiteButtonVariant;
  size?: SiteButtonSize;
  fullWidth?: boolean;
  className?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  target?: string;
  rel?: string;
};

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-2xl font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ui-primary)] focus-visible:ring-offset-2';

const SIZE_MAP: Record<SiteButtonSize, string> = {
  md: 'px-5 py-3 text-sm',
  lg: 'px-6 py-3.5 text-base sm:px-6 sm:py-4',
};

const VARIANT_MAP: Record<SiteButtonVariant, string> = {
  primary:
    'bg-(--ui-primary) text-white shadow-[0_18px_40px_rgba(140,28,28,0.22)] hover:-translate-y-0.5 hover:bg-(--ui-primary-strong)',
  secondary:
    'border border-(--ui-border) bg-white/90 text-(--ui-text) shadow-[0_14px_36px_rgba(140,28,28,0.07)] hover:-translate-y-0.5 hover:border-(--ui-primary)/30',
};

const cx = (...classes: Array<string | false | undefined>) => classes.filter(Boolean).join(' ');

export function SiteButton({
  children,
  href,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  leftIcon,
  rightIcon,
  target,
  rel,
}: SiteButtonProps) {
  const classNames = cx(BASE, SIZE_MAP[size], VARIANT_MAP[variant], fullWidth && 'w-full', className);

  const content = (
    <>
      {leftIcon}
      <span>{children}</span>
      {rightIcon}
    </>
  );

  if (!href) {
    return <button className={classNames}>{content}</button>;
  }

  if (href.startsWith('/')) {
    return (
      <Link href={href} className={classNames}>
        {content}
      </Link>
    );
  }

  return (
    <a href={href} target={target} rel={rel} className={classNames}>
      {content}
    </a>
  );
}