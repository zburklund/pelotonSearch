import type { BrowseCategory } from '../../api/types';
import styles from './FilterBar.module.css';

interface FilterBarProps {
  categories: BrowseCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
}

export function FilterBar({ categories, selectedCategory, onCategoryChange }: FilterBarProps) {
  return (
    <div className={styles.wrapper} role="tablist" aria-label="Filter by category">
      <button
        className={`${styles.pill} ${selectedCategory === '' ? styles.active : ''}`}
        onClick={() => onCategoryChange('')}
        role="tab"
        aria-selected={selectedCategory === ''}
      >
        All
      </button>
      {categories.map((cat) => (
        <button
          key={cat.id}
          className={`${styles.pill} ${selectedCategory === cat.id ? styles.active : ''}`}
          onClick={() => onCategoryChange(cat.id)}
          role="tab"
          aria-selected={selectedCategory === cat.id}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
}
