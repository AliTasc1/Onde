import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { Chip, Fill, H1, PrimaryButton, SecondaryButton, Stat, Txt } from '../components/ui';
import { RadialGlow } from '../components/visuals';
import { FEELINGS } from '../data/content';
import { findPattern } from '../data/patterns';
import { goTab } from '../lib/nav';
import { useStore } from '../store';
import { C } from '../theme';

/** 11 · Session Complete */
export default function Complete() {
  const result = useStore((s) => s.result);
  const play = useStore((s) => s.play);
  const [feel, setFeel] = useState<string | null>(null);
  const r = result ?? { ended: false, elapsed: play.duration * 60, pid: play.pid, intensity: play.intensity };
  const pat = findPattern(r.pid);

  const pickFeel = (f: string) => {
    setFeel(f);
    useStore.setState((s) => {
      const h = s.history.slice();
      if (h.length) h[h.length - 1] = { ...h[h.length - 1], feel: f };
      return { history: h };
    });
  };

  return (
    <Fill>
      <RadialGlow glows={[{ cx: 0.5, cy: 0.3, rx: 0.7, ry: 0.4, color: '#4ADE80', opacity: 0.08 }]} />
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: 'rgba(74,222,128,0.12)', borderWidth: 1, borderColor: 'rgba(74,222,128,0.3)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={40} color={C.green} />
        </View>
        <H1 size={30} style={{ marginTop: 8, textAlign: 'center' }}>{r.ended ? 'Session ended' : 'Session complete'}</H1>
        <Txt style={{ fontSize: 16, color: C.muted, maxWidth: 280, lineHeight: 24, textAlign: 'center' }}>Nice work taking a few minutes for yourself.</Txt>
        <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginTop: 16 }}>
          <Stat label="Time" value={`${Math.floor(r.elapsed / 60)}m ${String(r.elapsed % 60).padStart(2, '0')}s`} />
          <Stat label="Pattern" value={pat.name} />
          <Stat label="Intensity" value={`${r.intensity}/10`} />
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 16, gap: 12 }}>
          <Txt style={{ fontSize: 15, fontWeight: '600' }}>How do you feel?</Txt>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {FEELINGS.map((f) => <Chip key={f} label={f} active={feel === f} onPress={() => pickFeel(f)} style={{ height: 40, borderRadius: 20 }} />)}
          </View>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label="Done" onPress={() => goTab('home')} />
        <SecondaryButton label="Start Again" onPress={() => router.replace('/session')} />
      </View>
    </Fill>
  );
}
