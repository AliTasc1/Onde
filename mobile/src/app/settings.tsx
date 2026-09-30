import { View } from 'react-native';

import { ListPage } from '../components/ListPage';
import { Slider } from '../components/Slider';
import { Group, NavRow, ToggleRow, Txt } from '../components/ui';
import { ambienceCounts, ambienceTotal } from '../audio/ambience';
import { voiceClipCount } from '../audio/voice';
import { LANG_NAMES, LANGS, useT } from '../i18n';
import { go } from '../lib/nav';
import { LOCK_MODE_COUNT, useStore } from '../store';
import { C } from '../theme';

const NEXT_DUR: Record<number, number> = { 1: 3, 3: 5, 5: 10, 10: 15, 15: 1 };

/** 18 · Settings */
export default function Settings() {
  const tg = useStore((s) => s.tg);
  const flip = useStore((s) => s.flip);
  const limit = useStore((s) => s.limit);
  const defDur = useStore((s) => s.defDur);
  const lockMode = useStore((s) => s.lockMode);
  const set = useStore((s) => s.set);
  const showToast = useStore((s) => s.showToast);
  const adultConfirmed = useStore((s) => s.adultConfirmed);
  const voiceVolume = useStore((s) => s.voiceVolume);
  const voiceFreq = useStore((s) => s.voiceFreq);
  const clips = voiceClipCount();
  const ambienceVolume = useStore((s) => s.ambienceVolume);
  const amb = ambienceCounts();
  const lang = useStore((s) => s.lang);
  const t = useT();
  const T = t.settings;
  const pct = (v: number) => Math.round(v * 100);

  return (
    <ListPage title={T.title} sub={T.sub}>
      <View style={{ marginTop: 20, marginHorizontal: 24, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 2 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Txt style={{ fontSize: 16 }}>{T.limit}</Txt>
          <Txt style={{ fontSize: 16, color: C.muted }}>{t.common.of10(limit)}</Txt>
        </View>
        <Slider label={T.limit} value={limit} min={1} max={10} onChange={(v) => set({ limit: v })} valueText={t.detail.valueOf10(limit)} />
        <Txt style={{ fontSize: 13, color: C.faint }}>{T.limitNote}</Txt>
      </View>

      <Group title={T.haptics}>
        <NavRow label={T.defaultDuration} value={t.common.min(defDur)} icon="timer" onPress={() => set({ defDur: NEXT_DUR[defDur] ?? 5 })} />
        <ToggleRow label={T.autostop} sub={T.autostopSub} icon="clock" on={tg.autostop} onPress={() => flip('autostop')} />
        <NavRow label={T.lock} value={T.lockModes[lockMode]} icon="lock" onPress={() => set({ lockMode: (lockMode + 1) % LOCK_MODE_COUNT })} />
      </Group>
      <Group title={T.voiceGroup}>
        <ToggleRow label={T.voice} sub={T.voiceSub} icon="sound" on={tg.voice && adultConfirmed}
          onPress={() => (adultConfirmed ? flip('voice') : go('/adult'))} />
        {tg.voice && adultConfirmed ? (
          <>
            <NavRow label={T.howOften} value={T.frequencies[voiceFreq]} icon="waves" onPress={() => set({ voiceFreq: ((voiceFreq + 1) % 3) as 0 | 1 | 2 })} />
            <NavRow label={T.voicePack} value={clips ? T.voicePackValue(clips) : T.notInstalled} icon="headphones"
              onPress={() => showToast(clips ? T.moreVoices : T.noVoicePack)} />
          </>
        ) : null}
        <ToggleRow label={T.background} sub={T.backgroundSub} icon="waves" on={tg.ambience && adultConfirmed}
          onPress={() => (adultConfirmed ? flip('ambience') : go('/adult'))} />
        {tg.ambience && adultConfirmed ? (
          <NavRow label={T.soundPack} value={ambienceTotal() ? T.soundPackValue(ambienceTotal()) : T.notInstalled} icon="headphones"
            onPress={() => showToast(ambienceTotal() ? T.soundPackDetail(amb.bed, amb.rhythm, amb.accents, amb.cries) : T.noSoundPack)} />
        ) : null}
      </Group>
      {tg.voice && adultConfirmed ? (
        <View style={{ marginTop: 12, marginHorizontal: 24, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 16 }}>{T.voiceVolume}</Txt>
            <Txt style={{ fontSize: 16, color: C.muted }}>{T.percent(pct(voiceVolume))}</Txt>
          </View>
          <Slider label={T.voiceVolume} value={Math.round(voiceVolume * 10)} min={1} max={10} onChange={(v) => set({ voiceVolume: v / 10 })} valueText={T.percentA11y(pct(voiceVolume))} />
        </View>
      ) : null}
      {tg.ambience && adultConfirmed ? (
        <View style={{ marginTop: 12, marginHorizontal: 24, padding: 16, borderRadius: 20, backgroundColor: C.surface, gap: 2 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Txt style={{ fontSize: 16 }}>{T.backgroundVolume}</Txt>
            <Txt style={{ fontSize: 16, color: C.muted }}>{T.percent(pct(ambienceVolume))}</Txt>
          </View>
          <Slider label={T.backgroundVolume} value={Math.round(ambienceVolume * 10)} min={1} max={10} onChange={(v) => set({ ambienceVolume: v / 10 })} valueText={T.percentA11y(pct(ambienceVolume))} />
        </View>
      ) : null}
      <Group title={T.app}>
        <ToggleRow label={T.sound} icon="sound" on={tg.sound} onPress={() => flip('sound')} />
        <ToggleRow label={T.dark} icon="moon" on={tg.dark} onPress={() => (tg.dark ? showToast(T.lightSoon) : flip('dark'))} />
        <NavRow label={T.notifications} icon="bell" onPress={() => go('/notifications')} />
        <NavRow label={T.language} value={LANG_NAMES[lang]} icon="globe" onPress={() => set({ lang: LANGS[(LANGS.indexOf(lang) + 1) % LANGS.length] })} />
      </Group>
      <Group title={T.accessibility}>
        <ToggleRow label={T.rm} sub={T.rmSub} icon="eye" on={tg.rm} onPress={() => flip('rm')} />
        <ToggleRow label={T.visual} sub={T.visualSub} icon="waves" on={tg.visual} onPress={() => flip('visual')} />
      </Group>
      <Group title={T.device}>
        <ToggleRow label={T.battery} sub={T.batterySub} icon="battery" on={tg.battery} onPress={() => flip('battery')} />
        <NavRow label={T.privacy} icon="shield" onPress={() => go('/privacy')} />
      </Group>
    </ListPage>
  );
}
