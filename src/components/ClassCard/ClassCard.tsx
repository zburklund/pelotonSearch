import type { PelotonClass } from '../../api/types';
import styles from './ClassCard.module.css';

interface ClassCardProps {
  classData: PelotonClass;
}

function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  return `${mins} min`;
}

function formatDifficulty(score: number): string {
  if (!score) return '';
  return score.toFixed(1);
}

export function ClassCard({ classData }: ClassCardProps) {
  const instructorName = classData.instructors?.[0]?.name ?? 'Peloton';

  return (
    <div className={styles.card}>
      <div className={styles.imageWrapper}>
        {classData.image_url ? (
          <img
            className={styles.image}
            src={classData.image_url}
            alt={classData.title}
            loading="lazy"
          />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        {classData.duration > 0 && (
          <span className={styles.duration}>{formatDuration(classData.duration)}</span>
        )}
      </div>
      <div className={styles.body}>
        {classData.fitness_discipline_display_name && (
          <span className={styles.discipline}>{classData.fitness_discipline_display_name}</span>
        )}
        <h3 className={styles.title}>{classData.title}</h3>
        <p className={styles.instructor}>{instructorName}</p>
        {classData.difficulty_estimate > 0 && (
          <div className={styles.difficulty}>
            <span className={styles.difficultyLabel}>Difficulty</span>
            <span className={styles.difficultyScore}>{formatDifficulty(classData.difficulty_estimate)}</span>
          </div>
        )}
      </div>
    </div>
  );
}
