/**
 * WCAG Contrast Compliance Test
 * 
 * WCAG AA requires:
 * - Normal text: 4.5:1 minimum
 * - Large text (18pt+/14pt+ bold): 3:1 minimum
 * - UI components: 3:1 minimum
 */

// Utility function to calculate relative luminance
function getLuminance(hex: string): number {
  const rgb = parseInt(hex.slice(1), 16);
  const r = (rgb >> 16) & 0xff;
  const g = (rgb >> 8) & 0xff;
  const b = (rgb >> 0) & 0xff;

  const [rs, gs, bs] = [r, g, b].map(c => {
    const val = c / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Calculate contrast ratio between two colors
function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(color1);
  const lum2 = getLuminance(color2);
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Test results
interface ContrastTest {
  pair: string;
  ratio: number;
  passes: boolean;
  level: 'AA' | 'AAA' | 'FAIL';
}

const darkTheme = {
  background: '#0B0F1A',
  surface: '#1E293B',
  primary: '#4F46E5',
  secondary: '#22D3EE',
  text: '#E5E7EB',
  textMuted: '#9CA3AF',
};

const lightTheme = {
  background: '#FFFFFF',
  surface: '#F1F5F9',
  primary: '#4F46E5',
  secondary: '#22D3EE',
  text: '#0F172A',
  textMuted: '#475569',
};

function runContrastTests() {
  const tests: ContrastTest[] = [];

  // Dark theme tests
  const darkTests = [
    { pair: 'Text on Background', bg: darkTheme.background, fg: darkTheme.text },
    { pair: 'Muted Text on Background', bg: darkTheme.background, fg: darkTheme.textMuted },
    { pair: 'Text on Surface', bg: darkTheme.surface, fg: darkTheme.text },
    { pair: 'Primary on Background', bg: darkTheme.background, fg: darkTheme.primary },
    { pair: 'Secondary on Background', bg: darkTheme.background, fg: darkTheme.secondary },
  ];

  // Light theme tests
  const lightTests = [
    { pair: 'Text on Background', bg: lightTheme.background, fg: lightTheme.text },
    { pair: 'Muted Text on Background', bg: lightTheme.background, fg: lightTheme.textMuted },
    { pair: 'Text on Surface', bg: lightTheme.surface, fg: lightTheme.text },
    { pair: 'Primary on Background', bg: lightTheme.background, fg: lightTheme.primary },
    { pair: 'Secondary on Background', bg: lightTheme.background, fg: lightTheme.secondary },
  ];

  console.log('\n=== DARK THEME CONTRAST TESTS ===\n');
  darkTests.forEach(({ pair, bg, fg }) => {
    const ratio = getContrastRatio(bg, fg);
    const passes = ratio >= 4.5;
    const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL';
    console.log(`${pair}: ${ratio.toFixed(2)}:1 - ${passes ? '✅' : '❌'} ${level}`);
    tests.push({ pair: `[DARK] ${pair}`, ratio, passes, level });
  });

  console.log('\n=== LIGHT THEME CONTRAST TESTS ===\n');
  lightTests.forEach(({ pair, bg, fg }) => {
    const ratio = getContrastRatio(bg, fg);
    const passes = ratio >= 4.5;
    const level = ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'FAIL';
    console.log(`${pair}: ${ratio.toFixed(2)}:1 - ${passes ? '✅' : '❌'} ${level}`);
    tests.push({ pair: `[LIGHT] ${pair}`, ratio, passes, level });
  });

  const allPass = tests.every(t => t.passes);
  console.log('\n=== SUMMARY ===');
  console.log(`Total Tests: ${tests.length}`);
  console.log(`Passed: ${tests.filter(t => t.passes).length}`);
  console.log(`Failed: ${tests.filter(t => !t.passes).length}`);
  console.log(`Overall: ${allPass ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);

  return { tests, allPass };
}

// Run tests
if (typeof window === 'undefined') {
  // Node.js environment
  runContrastTests();
}

export { runContrastTests, getContrastRatio, getLuminance };
