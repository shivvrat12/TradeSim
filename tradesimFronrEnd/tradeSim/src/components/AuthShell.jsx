import { Link } from 'react-router-dom';

export function AuthShell({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <Link to="/" className="mb-6 text-2xl font-bold tracking-tight">
        TradeSim
      </Link>
      <div className="w-full max-w-sm rounded-lg border border-rule bg-surface p-6">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-1 mb-5 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
      <p className="mt-5 text-sm text-muted">{footer}</p>
    </div>
  );
}

export function Field({ label, ...inputProps }) {
  return (
    <label className="block text-sm font-medium">
      {label}
      <input
        {...inputProps}
        className="mt-1 block w-full rounded-md border border-rule bg-surface px-3 py-2 font-normal focus:border-cobalt focus:outline-none"
      />
    </label>
  );
}

export function FormError({ children }) {
  if (!children) return null;
  return (
    <p role="alert" className="rounded-md border border-loss/30 bg-loss/5 px-3 py-2 text-sm text-loss">
      {children}
    </p>
  );
}

export function SubmitButton({ children, ...props }) {
  return (
    <button
      type="submit"
      {...props}
      className="w-full rounded-md bg-cobalt py-2.5 font-semibold text-white hover:bg-cobalt-dark disabled:cursor-not-allowed disabled:opacity-60"
    >
      {children}
    </button>
  );
}
