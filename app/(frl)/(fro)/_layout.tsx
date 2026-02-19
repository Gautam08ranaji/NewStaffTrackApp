import { Stack } from 'expo-router';

export default function FroLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // 🔹 This hides the header
        contentStyle: { backgroundColor: '#121212' },
      }}
    />
  );
}
