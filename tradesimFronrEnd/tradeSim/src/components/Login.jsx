import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { errorMessage, login } from '../services/api';
import { AuthShell, Field, FormError, SubmitButton } from './AuthShell';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err, 'Log in failed. Check your email and password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Log in"
      subtitle="Pick up where you left your portfolio."
      footer={
        <>
          New here?{' '}
          <Link to="/signup" className="font-medium text-cobalt hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleLogin} className="space-y-4">
        {params.get('expired') && !error && (
          <FormError>Your session expired. Log in again to keep trading.</FormError>
        )}
        <FormError>{error}</FormError>
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <SubmitButton disabled={loading}>{loading ? 'Logging in…' : 'Log in'}</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default Login;
