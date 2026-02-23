import { useState } from 'react';
import type { FormEvent } from 'react';
import { setSessionId, verifySession } from '../../api/pelotonClient';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [sessionId, setSessionIdInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = sessionId.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    setSessionId(trimmed);

    const valid = await verifySession();
    if (valid) {
      onLogin();
    } else {
      setSessionId('');
      setError('Session ID not recognized. Make sure you copied it correctly and are still logged into onepeloton.com.');
    }
    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>PELOTON</div>
        <h1 className={styles.heading}>Connect Your Session</h1>
        <p className={styles.subheading}>
          Peloton's login API is no longer publicly accessible. Use your browser session instead.
        </p>

        <div className={styles.steps}>
          <p className={styles.stepsTitle}>How to get your Session ID:</p>
          <ol className={styles.stepsList}>
            <li>Open <strong>onepeloton.com</strong> and log in</li>
            <li>Open DevTools → <strong>Application</strong> → <strong>Cookies</strong> → <code>https://www.onepeloton.com</code></li>
            <li>Find the cookie named <code>peloton_session_id</code></li>
            <li>Copy its <strong>Value</strong> and paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            peloton_session_id
            <input
              className={styles.input}
              type="password"
              placeholder="Paste your session ID here..."
              value={sessionId}
              onChange={(e) => setSessionIdInput(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={loading || !sessionId.trim()}>
            {loading ? 'Verifying...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}
