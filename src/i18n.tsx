import React, { createContext, useContext, useState } from "react";

export type Lang = "fr" | "en" | "ar";

type Translations = Record<string, string>;

const messages: Record<Lang, Translations> = {
  fr: {
    "nav.home": "Accueil",
    "nav.protect": "Proteger",
    "nav.verify": "Verifier",
    "home.title": "Protegez vos medias numeriques",
    "home.subtitle":
      "iron-id combine trois couches de protection : signature C2PA, watermark frequentiel et protection anti-IA. Vos images sont authentifiees et verifiables en un clic.",
    "home.protect.cta": "Proteger",
    "home.protect.desc": "Uploader et proteger une image",
    "home.verify.cta": "Verifier",
    "home.verify.desc": "Verifier l'authenticite d'une image",
    "protect.title": "Proteger une image",
    "protect.upload.hint": "Glisser-deposer ou cliquer pour choisir",
    "protect.upload.sub": "Images, audio ou video — max 500 Mo",
    "protect.author": "Auteur",
    "protect.author.placeholder": "Votre nom (optionnel)",
    "protect.level": "Niveau de protection",
    "protect.button": "Proteger l'image",
    "protect.uploading": "Upload en cours...",
    "protect.processing": "Traitement en cours...",
    "protect.success": "Protection reussie",
    "protect.layers": "Couches appliquees",
    "protect.download": "Telecharger l'image protegee",
    "protect.again": "Proteger une autre image",
    "protect.error": "Erreur",
    "protect.retry": "Reessayer",
    "verify.title": "Verifier une image",
    "verify.hint": "Glisser-deposer ou cliquer pour choisir",
    "verify.hint.sub": "Image JPEG ou PNG a verifier",
    "verify.button": "Verifier l'authenticite",
    "verify.loading": "Analyse en cours...",
    "verify.watermarkDetected": "Watermark detecte",
    "verify.confidence": "Confiance watermark",
    "verify.c2paValid": "Signature C2PA valide",
    "verify.author": "Auteur",
    "verify.date": "Date originale",
    "verify.modifications": "Modifications detectees",
    "verify.details": "Details techniques",
    "verify.again": "Verifier une autre image",
    "footer.text": "iron-id",
    "nav.feedback": "Feedback",
    "feedback.title": "Feedback & commentaires",
    "feedback.subtitle": "Une idée, un bug, un avis ? Envoyez-nous un message.",
    "feedback.name": "Nom",
    "feedback.name.placeholder": "Votre nom",
    "feedback.email": "Email",
    "feedback.email.placeholder": "vous@exemple.com",
    "feedback.message": "Message",
    "feedback.message.placeholder": "Votre message ou commentaire...",
    "feedback.submit": "Envoyer",
    "feedback.sending": "Envoi...",
    "feedback.success": "Merci, votre message a bien été envoyé.",
    "feedback.error": "Impossible d'envoyer le message. Réessayez plus tard.",
    "status.authentic": "Authentique",
    "status.modified": "Modifié",
    "status.suspect": "Suspect",
    "status.unverified": "Non vérifié",
    "lang.fr": "FR",
    "lang.en": "EN",
    "lang.ar": "AR",
  },
  en: {
    "nav.home": "Home",
    "nav.protect": "Protect",
    "nav.verify": "Verify",
    "home.title": "Protect your digital media",
    "home.subtitle":
      "iron-id combines three protection layers: C2PA signature, frequency watermark and anti-AI protection. Your images are authenticated and verifiable in one click.",
    "home.protect.cta": "Protect",
    "home.protect.desc": "Upload and protect an image",
    "home.verify.cta": "Verify",
    "home.verify.desc": "Verify the authenticity of an image",
    "protect.title": "Protect an image",
    "protect.upload.hint": "Drag and drop or click to choose",
    "protect.upload.sub": "Images, audio or video — max 500 MB",
    "protect.author": "Author",
    "protect.author.placeholder": "Your name (optional)",
    "protect.level": "Protection level",
    "protect.button": "Protect image",
    "protect.uploading": "Uploading...",
    "protect.processing": "Processing...",
    "protect.success": "Protection successful",
    "protect.layers": "Layers applied",
    "protect.download": "Download protected image",
    "protect.again": "Protect another image",
    "protect.error": "Error",
    "protect.retry": "Retry",
    "verify.title": "Verify an image",
    "verify.hint": "Drag and drop or click to choose",
    "verify.hint.sub": "JPEG or PNG image to verify",
    "verify.button": "Verify authenticity",
    "verify.loading": "Analysis in progress...",
    "verify.watermarkDetected": "Watermark detected",
    "verify.confidence": "Watermark confidence",
    "verify.c2paValid": "C2PA signature valid",
    "verify.author": "Author",
    "verify.date": "Original date",
    "verify.modifications": "Modifications detected",
    "verify.details": "Technical details",
    "verify.again": "Verify another image",
    "status.authentic": "Authentic",
    "status.modified": "Modified",
    "status.suspect": "Suspect",
    "status.unverified": "Unverified",
    "nav.feedback": "Feedback",
    "feedback.title": "Feedback & comments",
    "feedback.subtitle": "An idea, a bug, feedback? Send us a message.",
    "feedback.name": "Name",
    "feedback.name.placeholder": "Your name",
    "feedback.email": "Email",
    "feedback.email.placeholder": "you@example.com",
    "feedback.message": "Message",
    "feedback.message.placeholder": "Your message or comment...",
    "feedback.submit": "Send",
    "feedback.sending": "Sending...",
    "feedback.success": "Thank you, your message has been sent.",
    "feedback.error": "Could not send message. Please try again later.",
    "footer.text": "iron-id",
    "lang.fr": "FR",
    "lang.en": "EN",
    "lang.ar": "AR",
  },
  ar: {
    "nav.home": "الرئيسية",
    "nav.protect": "حماية",
    "nav.verify": "تحقق",
    "home.title": "حماية الوسائط الرقمية",
    "home.subtitle":
      "تجمع iron-id بين ثلاث طبقات حماية: توقيع C2PA، علامة مائية ترددية وحماية ضد الذكاء الاصطناعي. يتم توثيق صورك ويمكن التحقق منها بنقرة واحدة.",
    "home.protect.cta": "حماية",
    "home.protect.desc": "رفع صورة وحمايتها",
    "home.verify.cta": "تحقق",
    "home.verify.desc": "التحقق من أصالة صورة",
    "protect.title": "حماية صورة",
    "protect.upload.hint": "اسحب وأسقط أو انقر لاختيار ملف",
    "protect.upload.sub": "صور، صوت أو فيديو — حتى 500 ميغابايت",
    "protect.author": "الكاتب",
    "protect.author.placeholder": "اسمك (اختياري)",
    "protect.level": "مستوى الحماية",
    "protect.button": "حماية الصورة",
    "protect.uploading": "جاري الرفع...",
    "protect.processing": "جاري المعالجة...",
    "protect.success": "تمت الحماية بنجاح",
    "protect.layers": "الطبقات المطبقة",
    "protect.download": "تحميل الصورة المحمية",
    "protect.again": "حماية صورة أخرى",
    "protect.error": "خطأ",
    "protect.retry": "إعادة المحاولة",
    "verify.title": "التحقق من صورة",
    "verify.hint": "اسحب وأسقط أو انقر لاختيار ملف",
    "verify.hint.sub": "صورة JPEG أو PNG للتحقق",
    "verify.button": "التحقق من الأصالة",
    "verify.loading": "جاري التحليل...",
    "verify.watermarkDetected": "تم اكتشاف العلامة المائية",
    "verify.confidence": "ثقة العلامة المائية",
    "verify.c2paValid": "توقيع C2PA صالح",
    "verify.author": "الكاتب",
    "verify.date": "التاريخ الأصلي",
    "verify.modifications": "تعديلات مكتشفة",
    "verify.details": "تفاصيل تقنية",
    "verify.again": "التحقق من صورة أخرى",
    "status.authentic": "أصلي",
    "status.modified": "معدل",
    "status.suspect": "مشتبه به",
    "status.unverified": "غير مؤكد",
    "nav.feedback": "تعليقات",
    "feedback.title": "تعليقات وملاحظات",
    "feedback.subtitle": "فكرة، خطأ، رأي؟ أرسل لنا رسالة.",
    "feedback.name": "الاسم",
    "feedback.name.placeholder": "اسمك",
    "feedback.email": "البريد",
    "feedback.email.placeholder": "you@example.com",
    "feedback.message": "الرسالة",
    "feedback.message.placeholder": "رسالتك أو تعليقك...",
    "feedback.submit": "إرسال",
    "feedback.sending": "جاري الإرسال...",
    "feedback.success": "شكراً، تم إرسال رسالتك.",
    "feedback.error": "تعذر إرسال الرسالة. حاول لاحقاً.",
    "footer.text": "iron-id",
    "lang.fr": "فر",
    "lang.en": "إن",
    "lang.ar": "عر",
  },
};

interface I18nContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("fr");

  const t = (key: string) => {
    const dict = messages[lang] || messages.en;
    return dict[key] ?? messages.en[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"}>{children}</div>
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}

