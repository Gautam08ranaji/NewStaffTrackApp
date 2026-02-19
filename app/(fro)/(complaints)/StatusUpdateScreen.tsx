import BodyLayout from "@/components/layout/BodyLayout";
import ReusableButton from "@/components/reusables/ReusableButton";
import { useTheme } from "@/theme/ThemeContext";
import { router } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dimensions,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import RemixIcon from "react-native-remix-icon";

const { width } = Dimensions.get("window");

type StepId = 1 | 2 | 3 | 4 | 5;

export default function StatusUpdateScreen() {
  const { theme } = useTheme();
  const colors = theme.colors;
  const typo = theme.typography;
  const { t } = useTranslation();

  const [notes, setNotes] = useState("");
  const [step, setStep] = useState<StepId>(1);

  const renderStepIndicator = (id: StepId) => {
    const isCompleted = id < step;
    const isActive = id === step;

    return (
      <TouchableOpacity
        key={id}
        onPress={() => setStep(id)}
        style={[
          styles.stepCircle,
          {
            backgroundColor: isCompleted
              ? colors.colorPrimary600
              : colors.colorPrimary500 + "22",
            borderColor: isActive ? colors.colorPrimary500 : "transparent"
          }
        ]}
        activeOpacity={0.7}
      >
        <Text
          style={[
            styles.stepText,
            { color: isCompleted ? "#fff" : colors.colorPrimary500 }
          ]}
        >
          {id}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <BodyLayout
      type="screen"
      screenName={t("statusUpdate.screenTitle")}
      scrollContentStyle={{ paddingHorizontal: 0 }}
    >
      <View style={styles.container}>

        {/* Steps Row */}
        <View style={styles.stepsRow}>
          {[1, 2, 3, 4, 5].map((id) => renderStepIndicator(id as StepId))}
        </View>

        {/* STEP 1 */}
        {step === 1 && (
          <View style={styles.stepHolder}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.colorPrimary500 + "22" }
              ]}
            >
              <RemixIcon
                name="checkbox-circle-line"
                size={40}
                color={colors.colorPrimary500}
              />
            </View>

            <Text style={[styles.title, { color: colors.colorPrimary500 }]}>
              {t("statusUpdate.step1Title")}
            </Text>

            <Text style={[styles.subtitle, { color: colors.colorTextSecondary }]}>
              {t("statusUpdate.step1Subtitle")}
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.btnPrimaryBg }]}
              onPress={() => setStep(2)}
            >
              <Text style={styles.primaryBtnText}>{t("statusUpdate.acceptCase")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <View style={styles.stepHolder}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.validationInfoText + "22" }
              ]}
            >
              <RemixIcon
                name="guide-line"
                size={40}
                color={colors.validationInfoText}
              />
            </View>

            <Text style={[styles.title, { color: colors.validationInfoText }]}>
              {t("statusUpdate.step2Title")}
            </Text>

            <Text style={[styles.subtitle, { color: colors.colorTextSecondary }]}>
              {t("statusUpdate.step2Subtitle")}
            </Text>

            <View
              style={[
                styles.info,
                { backgroundColor: colors.validationInfoText + "22" }
              ]}
            >
              <Text style={[typo.fontToast, { color: colors.validationInfoText }]}>
                {t("statusUpdate.locationTracking")}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.btnPrimaryBg }]}
              onPress={() => setStep(3)}
            >
              <Text style={styles.primaryBtnText}>{t("statusUpdate.updateStatus")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <View style={styles.stepHolder}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.colorError400 + "22" }
              ]}
            >
              <RemixIcon
                name="map-pin-line"
                size={40}
                color={colors.colorError400}
              />
            </View>

            <Text style={[styles.title, { color: colors.colorPrimary600 }]}>
              {t("statusUpdate.step3Title")}
            </Text>

            <Text style={[styles.subtitle, { color: colors.colorTextSecondary }]}>
              {t("statusUpdate.step3Subtitle")}
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.btnPrimaryBg }]}
              onPress={() => setStep(4)}
            >
              <Text style={styles.primaryBtnText}>{t("statusUpdate.step3Yes")}</Text>
            </TouchableOpacity>

            <ReusableButton
              title={t("statusUpdate.step3No")}
              containerStyle={{
                width: "100%",
                backgroundColor: colors.colorBgSurface,
                borderColor: colors.colorAccent500,
                borderWidth: 1
              }}
              textStyle={{ color: colors.colorAccent500 }}
            />
          </View>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <View style={styles.stepHolder}>
            <View
              style={[
                styles.iconWrapper,
                { backgroundColor: colors.validationInfoText + "22" }
              ]}
            >
              <RemixIcon
                name="question-answer-line"
                size={40}
                color={colors.validationInfoText}
              />
            </View>

            <Text style={[styles.title, { color: colors.colorPrimary500 }]}>
              {t("statusUpdate.step4Title")}
            </Text>

            <TouchableOpacity
              style={[styles.primaryBtn, { backgroundColor: colors.btnPrimaryBg }]}
              onPress={() => setStep(5)}
            >
              <Text style={styles.primaryBtnText}>{t("statusUpdate.step4Yes")}</Text>
            </TouchableOpacity>

            <ReusableButton
              title={"Call Durgesh"}
              containerStyle={{
                width: "100%",
                backgroundColor: colors.colorBgSurface,
                borderWidth: 1,
                borderColor: colors.colorPrimary500
              }}
              textStyle={{ color: colors.colorPrimary500 }}
              onPress={() => setStep(3)}
            />
          </View>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <View style={styles.stepHolder}>
            <Text
              style={[
                typo.fontToast,
                { color: colors.colorPrimary500, alignSelf: "flex-start" }
              ]}
            >
              {t("statusUpdate.step5Title")}
            </Text>

            <TextInput
              multiline
              placeholder={t("statusUpdate.notesPlaceholder")}
              value={notes}
              onChangeText={setNotes}
              style={[styles.notesBox, { borderColor: colors.colorPrimary500 }]}
            />

            <View style={styles.actionRow}>
              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: colors.colorBgSurface,
                    borderWidth: 1,
                    borderColor: colors.colorPrimary500
                  }
                ]}
                onPress={() => {
                  router.push("/AddPhotoScreen");
                }}
              >
                <View style={styles.actionContent}>
                  <RemixIcon name="camera-line" size={18} color={colors.colorPrimary500} />
                  <Text style={[typo.fontToast, { color: colors.colorPrimary500 }]}>
                    {t("statusUpdate.uploadPhoto")}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionBtn,
                  {
                    backgroundColor: colors.colorBgSurface,
                    borderWidth: 1,
                    borderColor: colors.colorAccent500
                  }
                ]}
                onPress={() => {
                  router.push("/AddVoiceScreen");
                }}
              >
                <View style={styles.actionContent}>
                  <RemixIcon name="mic-line" size={18} color={colors.colorAccent500} />
                  <Text style={[typo.fontToast, { color: colors.colorAccent500 }]}>
                    {t("statusUpdate.uploadVoice")}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <ReusableButton
              title={t("statusUpdate.saveAndUpdate")}
              containerStyle={{ width: "100%" }}
              onPress={() => {
                router.push('/(fro)/(complaints)')
              }}
            />
          </View>
        )}
      </View>
    </BodyLayout>
  );
}



const styles = StyleSheet.create({
  container: {
    paddingHorizontal: width * 0.05,
    paddingTop: 20,
    alignItems: "center",
    width: "100%",
  },

  stepsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 26,
    gap: width * 0.04,
  },

  stepCircle: {
    width: width * 0.11,
    height: width * 0.11,
    borderRadius: width * 0.055,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },

  stepText: {
    fontSize: width * 0.045,
    fontWeight: "700",
  },

  stepHolder: {
    width: "100%",
    alignItems: "center",
  },

  iconWrapper: {
    width: width * 0.23,
    height: width * 0.23,
    borderRadius: width * 0.115,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
  },

  title: {
    fontSize: width * 0.055,
    fontWeight: "700",
    marginBottom: 6,
    textAlign: "center",
  },

  subtitle: {
    fontSize: width * 0.04,
    marginBottom: 20,
    textAlign: "center",
  },

  primaryBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  primaryBtnText: {
    color: "#fff",
    fontSize: width * 0.045,
    fontWeight: "700",
  },

  info: {
    width: "100%",
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
  },

  notesBox: {
    width: "100%",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    height: width * 0.4,
    textAlignVertical: "top",
    backgroundColor: "#FFF",
  },

  actionRow: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginTop: 40,
    marginBottom: 15,
  },

  actionBtn: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },

  actionContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  actionContentAlt: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
});
