import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "../locales/ru.json";
import en from "../locales/en.json";

const savedLng = typeof localStorage !== "undefined" ? localStorage.getItem("i18n") : null;

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
  },
  lng: savedLng === "en" ? "en" : "ru",
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false,
  },
});

i18n.on("languageChanged", (lng) => {
  if (typeof localStorage !== "undefined") {
    localStorage.setItem("i18n", lng);
  }
});

export default i18n;
