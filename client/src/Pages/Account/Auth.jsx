import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../lib/auth';
import { isValidEmail, isValidPhoneClient } from '../../lib/validate';
import { Field } from '../../Components/UI/Field';
import Button from '../../Components/UI/Button';
import SectionDivider from '../../Components/Brand/SectionDivider';
import { useI18n } from '../../lib/i18n';

/**
 * Login and register.
 *
 * The phone number is the identifier, not the email. This is the Algerian norm
 * and an email-first login loses customers who genuinely do not have one to
 * hand.
 *
 * Both pages carry a visible line saying an account is not needed to order,
 * because a customer who lands here from the checkout must not conclude they
 * are blocked.
 */

function AuthShell({ title, intro, children, footer }) {
  return (
    <div className="mx-auto max-w-md px-4 pb-20 pt-12 sm:px-6">
      <h1 className="font-display text-xl tracking-[0.1em] text-ink">{title}</h1>
      <p className="mt-3 text-base leading-relaxed text-ink-muted">{intro}</p>

      {children}

      <SectionDivider className="mt-10" />

      <div className="mt-8 text-center">{footer}</div>
    </div>
  );
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useI18n();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const account = await login({ identifier, password });
      // Admins and super admins land in the admin panel.
      const destination =
        ['ADMIN', 'SUPER_ADMIN'].includes(account.role) ? '/admin' : location.state?.from || '/compte';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.login')}
      intro={t('auth.loginIntro')}
      footer={
        <p className="text-base text-ink-muted">
          {t('auth.noAccount')}{' '}
          <Link to="/inscription" className="text-ink underline decoration-gold underline-offset-4">
            {t('auth.register')}
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field
          label={t('auth.phoneOrEmail')}
          required
          type="text"
          inputMode="text"
          autoComplete="username"
          placeholder="05... ou email@example.com"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={error}
        />

        <Field
          label={t('auth.password')}
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />

        <Button type="submit" variant="primary" size="lg" full disabled={loading}>
          {loading ? t('auth.loggingIn') : t('auth.login')}
        </Button>
      </form>

      <p className="mt-6 rounded-sm border border-greige bg-greige/25 px-4 py-3 text-sm leading-relaxed text-ink-muted">
        {t('auth.guestNote')}{' '}
        <Link to="/catalogue" className="text-ink underline decoration-gold underline-offset-4">
          {t('common.seeAll')}
        </Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const { t } = useI18n();

  const [form, setForm] = useState({ nom: '', telephone: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitError(null);

    const next = {};
    if (!form.nom.trim()) next.nom = t('validation.nameRequired');
    if (!isValidPhoneClient(form.telephone)) {
      next.telephone = t('validation.phoneInvalid');
    }
    if (form.password.length < 6) next.password = t('auth.passwordMinLength');
    if (form.email && !isValidEmail(form.email)) next.email = t('validation.emailInvalid');

    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register(form);
      navigate('/compte', { replace: true });
    } catch (err) {
      setSubmitError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title={t('auth.register')}
      intro={t('auth.registerIntro')}
      footer={
        <p className="text-base text-ink-muted">
          {t('auth.hasAccount')}{' '}
          <Link to="/connexion" className="text-ink underline decoration-gold underline-offset-4">
            {t('auth.login')}
          </Link>
        </p>
      }
    >
      {submitError ? (
        <div
          role="alert"
          className="mt-6 rounded-sm border border-[#8C2F1F]/40 bg-[#8C2F1F]/5 px-4 py-3 text-base text-[#8C2F1F]"
        >
          {submitError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field
          label={t('checkout.name')}
          required
          autoComplete="name"
          value={form.nom}
          onChange={set('nom')}
          error={errors.nom}
        />

        <Field
          label={t('checkout.phone')}
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0X XX XX XX XX"
          value={form.telephone}
          onChange={set('telephone')}
          error={errors.telephone}
          hint={t('auth.phoneHint')}
        />

        <Field
          label={t('checkout.email')}
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
          error={errors.email}
        />

        <Field
          label={t('auth.password')}
          required
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint={t('auth.passwordHint')}
        />

        <Button type="submit" variant="primary" size="lg" full disabled={loading}>
          {loading ? t('auth.registering') : t('auth.createAccount')}
        </Button>
      </form>
    </AuthShell>
  );
}
