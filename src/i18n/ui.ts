export const languages = {
  es: 'Español',
  en: 'English',
};

export const defaultLang = 'es';

export const ui = {
  es: {
    'name': 'Daniel Torrealba',
    // Navigation
    'nav.home': 'Inicio',
    'nav.career': 'Trayectoria',
    'nav.posts': 'Posts',
    
    // Home page
    'home.title': 'Daniel Torrealba - Portafolio',
    'home.description': 'Portafolio de Daniel Torrealba',
    'home.greeting': 'Hola, soy',
    'home.nick': 'Dxnale',
    'home.intro': 'Construyo software accesible y de alto rendimiento con un enfoque en el minimalismo.',
    'home.cta.posts': 'Leer posts',
    'home.cta.career': 'Trayectoria',
    
    // career page
    'career.title': 'Trayectoria - Daniel Torrealba',
    'career.description': 'Conoce más sobre Daniel Torrealba',
    
    // posts page
    'posts.title': 'Blog - Daniel Torrealba',
    'posts.description': 'Blog de Daniel Torrealba',
  },
  en: {
    'name': 'Daniel Torrealba',
    // Navigation
    'nav.home': 'Home',
    'nav.career': 'Career',
    'nav.posts': 'Posts',
    
    // Home page
    'home.title': 'Daniel Torrealba - Portfolio',
    'home.description': 'Web Portfolio of Daniel Torrealba',
    'home.greeting': "Hello, I'm",
    'home.nick': 'Dxnale',
    'home.intro': 'I build accessible, high-performance software with minimalism in mind.',
    'home.cta.posts': 'Read posts',
    'home.cta.career': 'Career',
    
    // career page
    'career.title': 'Career - Daniel Torrealba',
    'career.description': 'Read about my career',
    
    // posts page
    'posts.title': 'Posts - Daniel Torrealba',
    'posts.description': 'Posts by Daniel Torrealba',
  },
} as const;

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang]) {
    return ui[lang][key] || ui[defaultLang][key];
  }
}
