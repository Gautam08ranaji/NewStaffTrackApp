import BodyLayout from "@/components/layout/BodyLayout";
import { addMobileAppMaster } from "@/features/fro/hospitalMasterApi";
import { useAppSelector } from "@/store/hooks";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

/* ================= ENDPOINT MAP ================= */



/* ================= SCREEN ================= */

export default function AddNewCentreScreen() {
  const params = useLocalSearchParams();
  const authState = useAppSelector((state) => state.auth);

  const centreType = Array.isArray(params.centreType)
    ? params.centreType[0]
    : params.centreType;

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [is24x7, setIs24x7] = useState(true);
  const [isEmergency, setIsEmergency] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  /* ================= FORM STATE ================= */

  const [formData, setFormData] = useState({
    centreName: "",
    description: "",
    address1: "",
    address2: "",
    district: "",
    state: "",
    primaryPhone: "",
    email: "",
    website: "",
    isEnabled: true,
  });

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  /* ================= PAYLOAD BUILDER ================= */

  const buildPayload = () => ({
    name: formData.centreName,
    description: formData.description,
    state: formData.state,
    stateId: 22,          // ⚠️ replace with selected stateId
    district: formData.district,
    districtId: 22,       // ⚠️ replace with selected districtId
    city: "",
    latLong: "",
    address: `${formData.address1} ${formData.address2}`.trim(),
    contactName: formData.centreName,
    contactPhone: formData.primaryPhone,
    contactWebsite: formData.website,
    contactEmail: formData.email,
    isEnabled: true,
  });

  /* ================= HANDLE SUBMIT ================= */

 const handleSubmit = async () => {
  if (!authState.userId || !authState.token || !authState.antiforgeryToken) {
    Alert.alert("Error", "User not authenticated");
    return;
  }

  const endpoint = centreType as string;

  // ✅ simple validation only
  if (!endpoint || typeof endpoint !== "string") {
    Alert.alert("Error", "Invalid centre type");
    return;
  }

  try {
    setIsLoading(true);

    const res = await addMobileAppMaster({
      endpoint, // ✅ EXACT value from route param
      bearerToken: authState.token,
      antiForgeryToken: authState.antiforgeryToken,
      data: {
        ...buildPayload(),
        userId: authState.userId,
      },
    });

    console.log("ADD CENTRE RESPONSE:", res);

    if (res?.success) {
      Alert.alert("Success", res.data?.message || "Centre added");
      // router.replace("/(fro)/(profile)")
    } else {
      Alert.alert("Failed", "Centre creation failed");
    }
  } catch (error: any) {
    console.error("❌ ADD CENTRE ERROR:", error);

    Alert.alert(
      "Error",
      error?.message ||
        error?.data?.Errors?.[0] ||
        "Something went wrong. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};


  /* ================= HANDLE NEXT STEP ================= */

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.centreName.trim()) {
        Alert.alert("Error", "Please enter centre name");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!formData.address1.trim()) {
        Alert.alert("Error", "Please enter address line 1");
        return;
      }
      if (!formData.district.trim()) {
        Alert.alert("Error", "Please enter district");
        return;
      }
      setStep(3);
    } else {
      handleSubmit();
    }
  };

  /* ================= UI ================= */

  return (
    <BodyLayout type="screen" screenName="Add New Centre">
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }}>
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.stepIndicator}>
              {[1, 2, 3].map((s) => (
                <View
                  key={s}
                  style={[
                    styles.stepCircle,
                    step === s && styles.stepCircleActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stepText,
                      step === s && styles.stepTextActive,
                    ]}
                  >
                    {s}
                  </Text>
                </View>
              ))}
            </View>

            {step === 1 && (
              <>
                <Text style={styles.label}>Centre Name *</Text>
                <TextInput
                  value={formData.centreName}
                  onChangeText={(v) => updateField("centreName", v)}
                  style={styles.input}
                />

                <Text style={styles.label}>Short Description</Text>
                <TextInput
                  value={formData.description}
                  onChangeText={(v) => updateField("description", v)}
                  multiline
                  style={[styles.input, styles.textArea]}
                />
              </>
            )}

            {step === 2 && (
              <>
                <Text style={styles.label}>Address Line 1 *</Text>
                <TextInput
                  value={formData.address1}
                  onChangeText={(v) => updateField("address1", v)}
                  style={styles.input}
                />

                <Text style={styles.label}>Address Line 2</Text>
                <TextInput
                  value={formData.address2}
                  onChangeText={(v) => updateField("address2", v)}
                  style={styles.input}
                />

                <Text style={styles.label}>District *</Text>
                <TextInput
                  value={formData.district}
                  onChangeText={(v) => updateField("district", v)}
                  style={styles.input}
                />

                <Text style={styles.label}>State</Text>
                <TextInput
                  value={formData.state}
                  onChangeText={(v) => updateField("state", v)}
                  style={styles.input}
                />
              </>
            )}

            {step === 3 && (
              <>
                <Text style={styles.label}>Primary Contact *</Text>
                <TextInput
                  value={formData.primaryPhone}
                  onChangeText={(v) => updateField("primaryPhone", v)}
                  keyboardType="phone-pad"
                  style={styles.input}
                />

                <Text style={styles.label}>Email</Text>
                <TextInput
                  value={formData.email}
                  onChangeText={(v) => updateField("email", v)}
                  style={styles.input}
                />

                <View style={styles.switchRow}>
                  <Text>24x7 Available</Text>
                  <Switch value={is24x7} onValueChange={setIs24x7} />
                </View>

                <View style={styles.switchRow}>
                  <Text>Emergency Support</Text>
                  <Switch value={isEmergency} onValueChange={setIsEmergency} />
                </View>
              </>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {step > 1 && (
          <TouchableOpacity
            style={[styles.button, styles.backButton]}
            onPress={() => setStep((p) => (p - 1) as 1 | 2 | 3)}
            disabled={isLoading}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]}
          onPress={handleNextStep}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading
              ? "Submitting..."
              : step === 3
              ? "Submit for Approval"
              : "Next"}
          </Text>
        </TouchableOpacity>
      </View>
    </BodyLayout>
  );
}

/* ================= STYLES ================= */

const styles = StyleSheet.create({
  container: { marginTop: 8, paddingHorizontal: 16 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16 },
  stepIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    gap: 8,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  stepCircleActive: { backgroundColor: "#00695C" },
  stepText: { color: "#616161", fontWeight: "600" },
  stepTextActive: { color: "#fff" },
  label: { marginTop: 14, marginBottom: 6, fontWeight: "500" },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
  },
  textArea: { height: 110 },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
  },
  button: {
    backgroundColor: "#00695C",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  backButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "#00695C",
    marginBottom: 8,
  },
  backButtonText: { color: "#00695C", fontWeight: "600" },
  buttonText: { color: "#fff", fontWeight: "600" },
  buttonDisabled: { opacity: 0.6 },
});
