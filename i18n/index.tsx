import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./locales/en.json";
import hi from "./locales/hi.json";

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

const fallbackLng = "en";

const deviceLanguage =
  Localization.getLocales()?.[0]?.languageCode ?? fallbackLng;

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: fallbackLng,
    fallbackLng,
    interpolation: {
      escapeValue: false,
    },
  })
  .then(async () => {
    try {
      const savedLang = await AsyncStorage.getItem("appLanguage");
      const lang = savedLang ?? deviceLanguage ?? fallbackLng;

      await i18n.changeLanguage(lang);
    } catch {
      await i18n.changeLanguage(fallbackLng);
    }
  });

i18n.on("languageChanged", async (lng) => {
  await AsyncStorage.setItem("appLanguage", lng);
});

export default i18n;
