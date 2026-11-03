import { cn } from '../../lib/utils';

/**
 * An article body, rendered as the HTML qyne-service stores. Safe to inject
 * because the service sanitises every body on write to a short allowlist of
 * tags and attributes (ADR-0010); this component must only ever be given a
 * body that came back from the service, never text typed in the browser.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return <div className={cn('article-body', className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
