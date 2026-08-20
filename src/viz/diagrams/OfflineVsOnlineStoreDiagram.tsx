import { useState } from 'react';
import { useVizTokens } from '../../theme/vizTokens';
import { VisualizationContainer } from '../primitives';
import { getConceptColor } from './diagramSystem';

type Store = 'offline' | 'online';
const INFO: Record<Store, { backend: string; scale: string; use: string }> = {
  offline: { backend: 'Data warehouse / lake', scale: 'Massive, historical', use: 'Generating training datasets -- can afford to be slow, needs to be comprehensive.' },
  online: { backend: 'Redis or similar fast KV store', scale: 'Small, current only', use: 'Real-time inference -- must return in single-digit milliseconds.' },
};

/** Same feature values, two structurally different stores for two
 * structurally different access patterns -- click either. */
export default function OfflineVsOnlineStoreDiagram() {
  const t = useVizTokens();
  const [store, setStore] = useState<Store>('online');
  const offlineColor = getConceptColor(t, 'query');
  const onlineColor = getConceptColor(t, 'attention');
  const info = INFO[store];

  return (
    <VisualizationContainer footer={info.use}>
      <div style={{ display: 'flex', gap: 8 }}>
        <div onClick={() => setStore('offline')} onMouseEnter={() => setStore('offline')} style={{ flex: 1, cursor: 'pointer', padding: '0.7rem', borderRadius: 9, background: store === 'offline' ? `${offlineColor}18` : t.surfaceAlt, border: `1.5px solid ${store === 'offline' ? offlineColor : t.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: store === 'offline' ? offlineColor : t.textPrimary }}>Offline store</div>
          <div style={{ fontSize: 9, color: t.textMuted, marginTop: 3 }}>{INFO.offline.backend}</div>
        </div>
        <div onClick={() => setStore('online')} onMouseEnter={() => setStore('online')} style={{ flex: 1, cursor: 'pointer', padding: '0.7rem', borderRadius: 9, background: store === 'online' ? `${onlineColor}18` : t.surfaceAlt, border: `1.5px solid ${store === 'online' ? onlineColor : t.border}`, textAlign: 'center' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, color: store === 'online' ? onlineColor : t.textPrimary }}>Online store</div>
          <div style={{ fontSize: 9, color: t.textMuted, marginTop: 3 }}>{INFO.online.backend}</div>
        </div>
      </div>
    </VisualizationContainer>
  );
}
