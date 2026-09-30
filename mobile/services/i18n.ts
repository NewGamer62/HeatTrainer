import { getLocales } from 'expo-localization';
import { I18n } from 'i18n-js';

const translations = {
  en: {
    auth: {
      invalid_credentials: "Your email or password is incorrect.",
      user_exists: "This email is already used by another account.",
      network_error: "Unable to contact the server. Please check your connection.",
      default_error: "An error occurred",
      welcome: "Welcome",
      login_success: "Login successful!",
      account_created: "Account created",
      welcome_heattrainer: "Welcome to HeatTrainer!",
      error_title: "Error",
      fill_all_fields: "Please fill all fields."
    }
  },
  fr: {
    auth: {
      invalid_credentials: "Votre email de connexion ou mot de passe est incorrect.",
      user_exists: "Cet e-mail est déjà utilisé par un autre compte.",
      network_error: "Impossible de contacter le serveur. Veuillez vérifier votre connexion.",
      default_error: "Une erreur est survenue",
      welcome: "Bienvenue",
      login_success: "Connexion réussie !",
      account_created: "Compte créé",
      welcome_heattrainer: "Bienvenue sur HeatTrainer !",
      error_title: "Erreur",
      fill_all_fields: "Veuillez remplir tous les champs."
    }
  }
};

const i18n = new I18n(translations);

i18n.locale = getLocales()[0].languageCode ?? 'en';
i18n.enableFallback = true;
i18n.defaultLocale = 'fr';

export default i18n;
