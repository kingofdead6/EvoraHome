import { EmptyState } from '../Components/UI/States';
import { useI18n } from '../lib/i18n';

export default function NotFound() {
  const { t } = useI18n();

  return (
    <EmptyState
      title={t('notFound.title')}
      message={t('notFound.message')}
      actionLabel={t('common.seeAll')}
      actionTo="/catalogue"
    />
  );
}
