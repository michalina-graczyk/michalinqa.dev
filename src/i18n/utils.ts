import { ui, defaultLang } from "./ui";

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split("/");
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof (typeof ui)[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  };
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    // If the path already has a language prefix (e.g. /en/something), strip it out so we can re-apply the correct one
    let pathWithoutLang = path;
    for (const locale of Object.keys(ui)) {
      if (path.startsWith(`/${locale}/`) || path === `/${locale}`) {
        pathWithoutLang = path.replace(`/${locale}`, "") || "/";
        break;
      }
    }

    // Default locale does not use a prefix
    if (l === defaultLang) {
      return pathWithoutLang;
    }
    
    // Non-default locale gets the prefix
    return `/${l}${pathWithoutLang === "/" ? "" : pathWithoutLang}`;
  };
}
