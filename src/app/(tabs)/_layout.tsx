import { Tabs } from 'expo-router';
import { BookOpen, Sparkles } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: '#0F172A',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'JOURNAL',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <BookOpen size={22} color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="reflections"
        options={{
          title: 'REFLECTIONS',
          tabBarIcon: ({ color, focused }) => (
            <View style={focused ? styles.activeIconWrapper : undefined}>
              <Sparkles size={22} color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    height: Platform.OS === 'ios' ? 88 : 68,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 28 : 10,
    elevation: 0,
    shadowOpacity: 0,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginTop: 4,
  },
  tabItem: {
    paddingTop: 4,
  },
  activeIconWrapper: {
    // Subtle highlight for the active tab
  },
});
