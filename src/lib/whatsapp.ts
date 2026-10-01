/**
 * wa.me link for a phone number as people actually type it: "+962 79 123 4567",
 * "00970568376775", or a local mobile without country code — "05…" is taken as
 * Palestinian (+970) and any other "0…" as Jordanian (+962).
 */
export function whatsAppLink(phone: string, text?: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('05')) digits = `970${digits.slice(1)}`;
  else if (digits.startsWith('0')) digits = `962${digits.slice(1)}`;
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}
