import { normalizeLanguage, createTranslator } from '../utils/i18n.js';

export const languageMiddleware = (req, res, next) => {
  let language = 'en';
  
  const customLangHeader = req.headers['x-language'];
  if (customLangHeader) {
    language = customLangHeader;
  } else {
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      const primaryLang = acceptLanguage.split(',')[0].trim();
      language = primaryLang;
    }
  }
  
  req.lang = normalizeLanguage(language);
  
  req.t = createTranslator(req.lang);
  
  next();
};

export default languageMiddleware;
