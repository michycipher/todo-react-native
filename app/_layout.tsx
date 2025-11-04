import Constants from "expo-constants";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { Stack } from "expo-router";

// Safely access convex URL
const convexUrl =
  Constants.expoConfig?.extra?.convexUrl || process.env.EXPO_PUBLIC_CONVEX_URL;

const convex = new ConvexReactClient(convexUrl!);

export default function RootLayout() {
  return (
    <ConvexProvider client={convex}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ConvexProvider>
  );
}
