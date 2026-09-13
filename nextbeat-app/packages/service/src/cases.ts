/** The five desk preset case studies — use template reasoning for these only. */
const PRESET_PATTERNS: RegExp[] = [
  /vendor invoices from the treasury/i,
  /month-end close.*transfer volume look normal/i,
  /surplus HBAR.*lending pools large enough/i,
  /alert on unusual Hedera outflows/i,
  /board asked how our treasury activity relates/i,
];

export function isPresetCase(assignment: string): boolean {
  const q = assignment.trim();
  return PRESET_PATTERNS.some((re) => re.test(q));
}
