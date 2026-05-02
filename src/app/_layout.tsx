import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ 
        headerShadowVisible: false, 
        headerStyle: { backgroundColor: '#F9FAFB' }, 
        contentStyle: { backgroundColor: '#F9FAFB' } 
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="calendar" options={{ title: "Calendar", headerBackVisible: true, headerBackTitleVisible: false }} />
        <Stack.Screen name="journal/[date]" options={{ title: "Journal", headerBackVisible: true, headerBackTitleVisible: false }} />
      </Stack>
    </>
  );
}
