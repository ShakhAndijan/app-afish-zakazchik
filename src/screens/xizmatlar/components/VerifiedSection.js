import { View, Text, TouchableOpacity } from 'react-native';
import AfishLoader from '../../../components/AfishLoader';
import { useLanguage } from '../../../context/LanguageContext';
import { useXizmatlarStyles } from '../styles';
import WorkerList from './WorkerList';
import EmptyBox from './EmptyBox';

// "Faqat sertifikatlangan" yoqilganda bosh ro'yxatda ko'rinadigan tasdiqlangan ustalar.
export default function VerifiedSection({ verified, onClear, onSelectWorker }) {
  const { t: tr } = useLanguage();
  const { styles } = useXizmatlarStyles();

  return (
    <>
      <View style={styles.verifiedHeader}>
        <Text style={[styles.groupLabel, { marginBottom: 0 }]}>
          {tr('xizmatlar.browse.verifiedMasters', { count: verified.total ?? verified.items.length })}
        </Text>
        <TouchableOpacity onPress={onClear}>
          <Text style={styles.resetLink}>{tr('xizmatlar.browse.clearVerified')}</Text>
        </TouchableOpacity>
      </View>
      {verified.loading ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <AfishLoader size={80} />
        </View>
      ) : verified.items.length > 0 ? (
        <WorkerList workers={verified.items} onSelect={onSelectWorker} style={{ marginBottom: 22 }} />
      ) : (
        <EmptyBox text={tr('xizmatlar.browse.verifiedEmpty')} style={{ marginBottom: 22 }} />
      )}
    </>
  );
}
