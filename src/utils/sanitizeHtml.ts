import DOMPurify from 'dompurify';

/**
 * Sanitiza o conteúdo HTML usando a biblioteca DOMPurify para prevenir ataques XSS.
 * @param html O HTML potencialmente inseguro.
 * @returns O HTML sanitizado e seguro.
 */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html);
}
