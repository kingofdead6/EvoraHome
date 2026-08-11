import { EmptyState } from '../Components/UI/States';

export default function NotFound() {
  return (
    <EmptyState
      title="Cette page n'existe pas"
      message="Le lien est peut-être ancien. Le catalogue complet est toujours là."
      actionLabel="Voir le catalogue"
      actionTo="/catalogue"
    />
  );
}
