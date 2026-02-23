import { useState, useEffect } from 'react';
import { LoginForm } from './components/LoginForm/LoginForm';
import { SearchBar } from './components/SearchBar/SearchBar';
import { FilterBar } from './components/FilterBar/FilterBar';
import { ClassList } from './components/ClassList/ClassList';
import { fetchBrowseCategories } from './api/pelotonClient';
import { useClassSearch } from './hooks/useClassSearch';
import type { BrowseCategory } from './api/types';
import styles from './App.module.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState<BrowseCategory[]>([]);

  const { classes, loading, error } = useClassSearch(
    searchQuery,
    selectedCategory,
    isLoggedIn
  );

  useEffect(() => {
    if (!isLoggedIn) return;
    fetchBrowseCategories()
      .then((res) => setCategories(res.browse_categories ?? []))
      .catch(() => {
        // Non-fatal — filters just won't show
      });
  }, [isLoggedIn]);

  if (!isLoggedIn) {
    return <LoginForm onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <span className={styles.logo}>PELOTON</span>
        <div className={styles.searchWrapper}>
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.controls}>
          <p className={styles.resultCount}>
            {!loading && `${classes.length} class${classes.length !== 1 ? 'es' : ''} found`}
          </p>
          <FilterBar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
          />
        </div>

        <ClassList classes={classes} loading={loading} error={error} />
      </main>
    </div>
  );
}

export default App;
