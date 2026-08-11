import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

import { useAuth } from '../../lib/auth';
import { isValidPhoneClient } from '../../lib/validate';
import { Field } from '../../Components/UI/Field';
import Button from '../../Components/UI/Button';
import SectionDivider from '../../Components/Brand/SectionDivider';

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

  const [telephone, setTelephone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const account = await login({ telephone, password });
      // Admins land in the admin, customers land where they were headed.
      const destination =
        account.role === 'ADMIN' ? '/admin' : location.state?.from || '/compte';
      navigate(destination, { replace: true });
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Se connecter"
      intro="Retrouvez vos commandes, vos favoris et vos adresses."
      footer={
        <p className="text-base text-ink-muted">
          Pas encore de compte ?{' '}
          <Link to="/inscription" className="text-ink underline decoration-gold underline-offset-4">
            Créer un compte
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="mt-8 flex flex-col gap-5">
        <Field
          label="Téléphone"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0X XX XX XX XX"
          value={telephone}
          onChange={(e) => setTelephone(e.target.value)}
        />

        <Field
          label="Mot de passe"
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={error}
        />

        <Button type="submit" variant="primary" size="lg" full disabled={loading}>
          {loading ? 'Connexion' : 'Se connecter'}
        </Button>
      </form>

      <p className="mt-6 rounded-sm border border-greige bg-greige/25 px-4 py-3 text-sm leading-relaxed text-ink-muted">
        Vous n&apos;avez pas besoin de compte pour commander.{' '}
        <Link to="/catalogue" className="text-ink underline decoration-gold underline-offset-4">
          Voir le catalogue
        </Link>
      </p>
    </AuthShell>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

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
    if (!form.nom.trim()) next.nom = 'Votre nom est requis';
    if (!isValidPhoneClient(form.telephone)) {
      next.telephone = 'Numéro invalide. Format : 05, 06 ou 07 suivi de 8 chiffres';
    }
    if (form.password.length < 6) next.password = 'Au moins 6 caractères';

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
      title="Créer un compte"
      intro="Pour retrouver vos commandes et garder vos adresses d'une fois sur l'autre."
      footer={
        <p className="text-base text-ink-muted">
          Vous avez déjà un compte ?{' '}
          <Link to="/connexion" className="text-ink underline decoration-gold underline-offset-4">
            Se connecter
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
          label="Nom et prénom"
          required
          autoComplete="name"
          value={form.nom}
          onChange={set('nom')}
          error={errors.nom}
        />

        <Field
          label="Téléphone"
          required
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="0X XX XX XX XX"
          value={form.telephone}
          onChange={set('telephone')}
          error={errors.telephone}
          hint="C'est votre identifiant de connexion."
        />

        <Field
          label="Email (facultatif)"
          type="email"
          autoComplete="email"
          value={form.email}
          onChange={set('email')}
        />

        <Field
          label="Mot de passe"
          required
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set('password')}
          error={errors.password}
          hint="6 caractères minimum."
        />

        <Button type="submit" variant="primary" size="lg" full disabled={loading}>
          {loading ? 'Création' : 'Créer mon compte'}
        </Button>
      </form>
    </AuthShell>
  );
}
