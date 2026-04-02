import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { Text, View } from "react-native";

export default function AddVoiceScreen() {
  const { theme } = useTheme();

  return (
    <BodyLayout type="screen" screenName="Add Voice">
      <View style={{ padding: 20 }}>
        <Text style={{ color: theme.colors.colorPrimary600, fontSize: 16 }}>
          🎤 Voice recording feature temporarily unavailable
        </Text>

        <Text
          style={{
            marginTop: 10,
            color: theme.colors.colorTextSecondary,
          }}
        >
          This feature will be added later.
        </Text>
      </View>
    </BodyLayout>
  );
}