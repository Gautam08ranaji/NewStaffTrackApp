import { useAppSelector } from "@/store/hooks";
import { Redirect } from "expo-router";
import React from "react";
import { View } from "react-native";

export default function Index() {
  const { token, role } = useAppSelector((state: any) => state.auth);

  if (token === undefined) {
    return <View style={{ flex: 1 }} />;
  }

  if (!token) {
    return <Redirect href="/(onboarding)" />;
  }

  switch (role) {
    case "FRO":
      return <Redirect href="/(fro)/(dashboard)" />;

    case "FRL":
      return <Redirect href="/(frl)/(dashboard)" />;

    default:
      return <Redirect href="/(onboarding)" />;
  }
}