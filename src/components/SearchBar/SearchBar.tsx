import styles from './SearchBar.module.css';

interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className={styles.wrapper}>
      <span className={styles.icon}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </span>
      <input
        className={styles.input}
        type="search"
        placeholder="Search classes..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Search classes"
      />
    </div>
  );
}
