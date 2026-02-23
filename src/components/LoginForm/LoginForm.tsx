import { useState } from 'react';
import type { FormEvent } from 'react';
import { registerToken, verifyToken } from '../../api/pelotonClient';
import styles from './LoginForm.module.css';

interface LoginFormProps {
  onLogin: () => void;
}

export function LoginForm({ onLogin }: LoginFormProps) {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = token.trim();
    if (!trimmed) return;

    setLoading(true);
    setError(null);
    try {
      await registerToken(trimmed);
      const valid = await verifyToken();
      if (valid) {
        onLogin();
      } else {
        await registerToken('');
        setError('Token not recognized or expired. Please grab a fresh one from the Peloton site.');
      }
    } catch {
      setError('Could not connect to the proxy. Is the dev server running?');
    }
    setLoading(false);
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <div className={styles.logo}>PELOTON</div>
        <h1 className={styles.heading}>Connect Your Session</h1>
        <p className={styles.subheading}>
          Peloton now uses Auth0 JWT tokens. Grab yours from the Peloton site in seconds.
        </p>

        <div className={styles.steps}>
          <p className={styles.stepsTitle}>How to get your token:</p>
          <ol className={styles.stepsList}>
            <li>Open <strong>members.onepeloton.com/classes</strong> and log in</li>
            <li>Open DevTools (<code>Cmd+Option+I</code>) → <strong>Console</strong> tab</li>
            <li>Paste this command and press Enter:
              <pre className={styles.code}>{`JSON.parse(localStorage.getItem(Object.keys(localStorage).find(k=>k.includes('api.onepeloton')))).body.access_token`}</pre>
            </li>
            <li>Copy the printed token value and paste it below</li>
          </ol>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Bearer Token
            <input
              className={styles.input}
              type="password"
              placeholder="Paste your access token here..."
              value={token}
              onChange={(e) => setToken(e.target.value)}
              autoComplete="off"
              spellCheck={false}
              required
            />
          </label>
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.button} type="submit" disabled={loading || !token.trim()}>
            {loading ? 'Verifying...' : 'Connect'}
          </button>
        </form>
      </div>
    </div>
  );
}
