import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const baseUrl = import.meta.env.BASE_URL;
  let path = url.pathname;
  if (path.startsWith(baseUrl)) {
    path = path.slice(baseUrl.length);
  }
  if (path.startsWith('/')) {
    path = path.slice(1);
  }
  const [lang] = path.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getPathWithoutLang(url: URL) {
  const lang = getLangFromUrl(url);
  if (lang === defaultLang) return url.pathname;
  return url.pathname.replace(`/${lang}`, '') || '/';
}
