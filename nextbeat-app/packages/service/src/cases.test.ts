import { describe, expect, it } from 'vitest';
import { isPresetCase } from './cases.js';

describe('isPresetCase', () => {
  it('matches the five desk presets', () => {
    expect(
      isPresetCase(
        "Our payment agent is about to settle this week's vendor invoices from the treasury — should I approve?",
      ),
    ).toBe(true);
    expect(isPresetCase('What is the current Compound TVL?')).toBe(false);
  });
});
