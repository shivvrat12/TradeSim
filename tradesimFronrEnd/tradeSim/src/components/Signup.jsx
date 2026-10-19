import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { errorMessage, signUp } from '../services/api';
import { formatUsd, STARTING_BALANCE } from '../lib/format';
import { AuthShell, Field, FormError, SubmitButton } from './AuthShell';

function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Use at least 6 characters for your password.');
      return;
    }
    if (password !== confirmPassword) {
      setError("The two passwords don't match.");
      return;
    }
    setLoading(true);
    try {
      await signUp(name, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(
        err.response?.status === 409
          ? 'An account with this email already exists. Log in instead.'
          : errorMessage(err, 'Could not create your account. Try again.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Create an account"
      subtitle={`You start with ${formatUsd(STARTING_BALANCE)} in virtual cash.`}
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-cobalt hover:underline">
            Log in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSignup} className="space-y-4">
        <FormError>{error}</FormError>
        <Field label="Name" type="text" autoComplete="name" required value={name} onChange={(e) => setName(e.target.value)} />
        <Field label="Email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        <Field
          label="Password"
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Field
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          required
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <SubmitButton disabled={loading}>{loading ? 'Creating account…' : 'Create account'}</SubmitButton>
      </form>
    </AuthShell>
  );
}

export default Signup;
