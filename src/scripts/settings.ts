const KEY = 'lib:settings:v1';
const THEMES = ['auto', 'light', 'sepia', 'dark'] as const;
type Settings = { theme?: (typeof THEMES)[number]; fontSize?: number };

export const readSettings = (): Settings => {
  try { return JSON.parse(localStorage.getItem(KEY) || '{}'); } catch { return {}; }
};
const writeSettings = (s: Settings) => {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* storage unavailable */ }
};

const applyTheme = (theme: string) => {
  const resolved = theme === 'auto'
    ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  document.documentElement.dataset.theme = resolved;
};

const themeBtn = document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle], #theme-toggle');
const label = (t: string) => `Theme: ${t}`;
themeBtn.forEach((btn) => {
  btn.textContent = label(readSettings().theme || 'auto');
  btn.addEventListener('click', () => {
    const s = readSettings();
    const next = THEMES[(THEMES.indexOf(s.theme || 'auto') + 1) % THEMES.length];
    writeSettings({ ...s, theme: next });
    applyTheme(next);
    themeBtn.forEach((b) => (b.textContent = label(next)));
  });
});

document.querySelectorAll<HTMLButtonElement>('[data-font]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const s = readSettings();
    const current = s.fontSize || 1.15;
    const next = Math.min(1.75, Math.max(0.9, +(current + (btn.dataset.font === 'up' ? 0.1 : -0.1)).toFixed(2)));
    writeSettings({ ...s, fontSize: next });
    document.documentElement.style.setProperty('--font-size', next + 'rem');
  });
});
