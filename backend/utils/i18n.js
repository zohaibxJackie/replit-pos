import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const locales = {};
const supportedLanguages = ['en', 'ur'];
const defaultLanguage = 'en';

function loadLocales() {
  for (const lang of supportedLanguages) {
    try {
      const filePath = path.join(__dirname, '..', 'locales', `${lang}.json`);
      const content = fs.readFileSync(filePath, 'utf-8');
      locales[lang] = JSON.parse(content);
    } catch (error) {
      console.error(`Failed to load locale file for ${lang}:`, error.message);
      locales[lang] = {};
    }
  }
}

loadLocales();

function getNestedValue(obj, path) {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

function interpolate(template, params) {
  if (!params || typeof template !== 'string') return template;
  
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return params[key] !== undefined ? params[key] : match;
  });
}

export function t(key, lang = defaultLanguage, params = {}) {
  const normalizedLang = normalizeLanguage(lang);
  
  let message = getNestedValue(locales[normalizedLang], key);
  
  if (message === undefined && normalizedLang !== defaultLanguage) {
    message = getNestedValue(locales[defaultLanguage], key);
  }
  
  if (message === undefined) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  
  return interpolate(message, params);
}

export function normalizeLanguage(lang) {
  if (!lang) return defaultLanguage;
  
  const baseLang = lang.split('-')[0].split('_')[0].toLowerCase();
  
  if (supportedLanguages.includes(baseLang)) {
    return baseLang;
  }
  
  return defaultLanguage;
}

export function getSupportedLanguages() {
  return [...supportedLanguages];
}

export function isLanguageSupported(lang) {
  return supportedLanguages.includes(normalizeLanguage(lang));
}

export function createTranslator(lang) {
  const normalizedLang = normalizeLanguage(lang);
  return (key, params = {}) => t(key, normalizedLang, params);
}

export default {
  t,
  normalizeLanguage,
  getSupportedLanguages,
  isLanguageSupported,
  createTranslator
};
