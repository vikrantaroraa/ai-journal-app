import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack screenOptions={{ 
      headerShadowVisible: false, 
      headerStyle: { backgroundColor: '#F9FAFB' }, 
      contentStyle: { backgroundColor: '#F9FAFB' } 
    }}>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="calendar" options={{ title: "Calendar", headerBackVisible: true, headerBackTitleVisible: false }} />
      <Stack.Screen name="journal/[date]" options={{ title: "Journal", headerBackVisible: true, headerBackTitleVisible: false }} />
    </Stack>
  );
}
