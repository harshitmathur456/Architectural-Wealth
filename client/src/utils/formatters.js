/**
 * Utility functions for Indian currency and number formatting with commas
 */

export function formatWithCommas(value) {
  if (value === null || value === undefined || value === '') return '';
  
  // Remove existing commas
  const str = String(value).replace(/,/g, '');
  if (isNaN(str) || str.trim() === '') return '';

  const parts = str.split('.');
  const intPart = parts[0];
  const decPart = parts.length > 1 ? '.' + parts[1].slice(0, 2) : '';

  if (intPart === '') return decPart;

  // Format integer with Indian numbering system (en-IN)
  const formattedInt = Number(intPart).toLocaleString('en-IN');
  return formattedInt + decPart;
}

export function parseRawNumber(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;
  const clean = String(value).replace(/,/g, '');
  const num = Number(clean);
  return isNaN(num) ? 0 : num;
}
