import { Stack } from 'expo-router';

export default function DashBoardLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, 
        contentStyle: { backgroundColor: '#121212' },
      }}
    />
  );
}
