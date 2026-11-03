import { useLanguage } from '../../../context/LanguageContext';
import SectionTitle from './SectionTitle';
import WorksCarousel from './WorksCarousel';

// "Platformada bajarilgan ishlar": ustaning buyurtmalari bo'yicha oldin/keyin suratlari. Ish bo'lmasa — chizilmaydi.
export default function CompletedJobsSection({ jobs, onSelectWork }) {
  const { t: tr } = useLanguage();
  if (jobs.length === 0) return null;

  return (
    <>
      <SectionTitle
        icon="check-decagram-outline"
        title={tr('ustaDetail.completedJobsTitle')}
        style={{ paddingHorizontal: 20 }}
      />
      <WorksCarousel works={jobs} onSelectWork={onSelectWork} />
    </>
  );
}
