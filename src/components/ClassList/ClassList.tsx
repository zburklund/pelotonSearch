import type { PelotonClass } from '../../api/types';
import { ClassCard } from '../ClassCard/ClassCard';
import styles from './ClassList.module.css';

interface ClassListProps {
  classes: PelotonClass[];
  loading: boolean;
  error: string | null;
}

export function ClassList({ classes, loading, error }: ClassListProps) {
  if (loading) {
    return (
      <div className={styles.centered}>
        <div className={styles.spinner} aria-label="Loading classes" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.centered}>
        <p className={styles.errorText}>{error}</p>
      </div>
    );
  }

  if (classes.length === 0) {
    return (
      <div className={styles.centered}>
        <p className={styles.emptyText}>No classes found. Try a different search or category.</p>
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {classes.map((cls) => (
        <ClassCard key={cls.id} classData={cls} />
      ))}
    </div>
  );
}
