import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useQuoteModal } from '../QuoteModalProvider';

/**
 * Link that understands our three kinds of targets: "#quote" (opens the
 * quote pop-up), site paths ("/about"), and anything else (tel:, mailto:, https:).
 */
export function SmartLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const { open: openQuote } = useQuoteModal();

  if (href === '#quote') {
    return (
      <button type="button" onClick={() => openQuote({ source: 'page-button' })} className={`${className ?? ''} cursor-pointer`}>
        {children}
      </button>
    );
  }
  if (href.startsWith('/')) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//i.test(href);
  return (
    <a
      href={href || '#'}
      className={className}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
    </a>
  );
}
