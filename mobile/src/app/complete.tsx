import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '../components/Icon';
import { Chip, Fill, H1, PrimaryButton, SecondaryButton, Stat, Txt } from '../components/ui';
import { RadialGlow } from '../components/visuals';
import { findPattern } from '../data/patterns';
import { patName, useT } from '../i18n';
import { goTab } from '../lib/nav';
import { useStore } from '../store';
import { C } from '../theme';

/** 11 · Session Complete */
export default function Complete() {
  const result = useStore((s) => s.result);
  const t = useT();
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
        <H1 size={30} style={{ marginTop: 8, textAlign: 'center' }}>{r.ended ? t.complete.ended : t.complete.done}</H1>
        <Txt style={{ fontSize: 16, color: C.muted, maxWidth: 280, lineHeight: 24, textAlign: 'center' }}>{t.complete.body}</Txt>
        <View style={{ flexDirection: 'row', gap: 8, alignSelf: 'stretch', marginTop: 16 }}>
          <Stat label={t.complete.time} value={t.complete.elapsed(Math.floor(r.elapsed / 60), r.elapsed % 60)} />
          <Stat label={t.complete.pattern} value={patName(t, pat)} />
          <Stat label={t.common.intensity} value={`${r.intensity}/10`} />
        </View>
        <View style={{ alignSelf: 'stretch', marginTop: 16, gap: 12 }}>
          <Txt style={{ fontSize: 15, fontWeight: '600' }}>{t.complete.feel}</Txt>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
            {t.complete.feelings.map((f) => <Chip key={f} label={f} active={feel === f} onPress={() => pickFeel(f)} style={{ height: 40, borderRadius: 20 }} />)}
          </View>
        </View>
      </View>
      <View style={{ gap: 12 }}>
        <PrimaryButton label={t.complete.finish} onPress={() => goTab('home')} />
        <SecondaryButton label={t.complete.again} onPress={() => router.replace('/session')} />
      </View>
    </Fill>
  );
}
