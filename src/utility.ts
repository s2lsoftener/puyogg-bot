export function cleanIdString(atName: string): string {
  return atName.replace(/\D/g, '');
}