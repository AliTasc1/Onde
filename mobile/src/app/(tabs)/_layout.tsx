import { Tabs } from 'expo-router';

import { TabBar } from '../../components/TabBar';
import { C } from '../../theme';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: C.bg }, animation: 'fade' }}
    >
      <Tabs.Screen name="home" />
      <Tabs.Screen name="library" />
      <Tabs.Screen name="custom" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}
