import { useTheme, Theme } from '../context/ThemeContext';

const themes: { name: Theme; label: string; color: string }[] = [
  { name: 'dark', label: '🌙 Dark', color: 'bg-gray-900' },
  { name: 'light', label: '☀️ Light', color: 'bg-gray-100' },
  { name: 'blue', label: '🔵 Blue', color: 'bg-blue-100' },
  { name: 'purple', label: '💜 Purple', color: 'bg-purple-100' },
  { name: 'pink', label: '🌸 Pink', color: 'bg-pink-100' },
];

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={`px-3 py-1 rounded-lg text-xs font-semibold transition transform ${
            theme === t.name
              ? 'ring-2 ring-primary scale-110'
              : 'hover:scale-105'
          } ${t.color}`}
          title={t.label}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
};
