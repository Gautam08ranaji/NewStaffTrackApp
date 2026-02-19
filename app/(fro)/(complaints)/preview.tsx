import BodyLayout from "@/components/layout/BodyLayout";
import { useTheme } from "@/theme/ThemeContext";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { Image, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export default function DocumentPreviewScreen() {
  const { theme } = useTheme();
  const { id, name, type } = useLocalSearchParams();

  // Replace with your real API / CDN URL
  const documentUrl = `http://43.230.203.249:89/api/commomn/download/${id}`;

  console.log(documentUrl);

  console.log(id);

  const isPdf = type === "PDF";

  return (
    <BodyLayout type="screen" screenName={String(name)}>
      <View style={styles.container}>
        {isPdf ? (
          <WebView
            source={{ uri: documentUrl }}
            style={styles.webview}
            startInLoadingState
          />
        ) : (
          <Image
            source={{ uri: documentUrl }}
            style={styles.image}
            resizeMode="contain"
          />
        )}
      </View>
    </BodyLayout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    borderRadius: 12,
    overflow: "hidden",
  },
  webview: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
