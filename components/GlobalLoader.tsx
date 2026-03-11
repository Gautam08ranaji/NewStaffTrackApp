import { useAppSelector } from "@/store/hooks";
import React from "react";
import { Image, StyleSheet, View } from "react-native";

export default function GlobalLoader() {
  const loading = useAppSelector((state) => state.loader.loading);

  if (!loading) return null;

  return (
    <View style={styles.container}>
      <Image
        source={require("@/assets/loader/Loading.gif")}
        style={styles.loader}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    elevation: 9999,
    zIndex: 999,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  loader: {
    width: 220,
    height: 220,
  },
});