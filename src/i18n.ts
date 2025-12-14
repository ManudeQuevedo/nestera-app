import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Use provided locale or fall back to default
  const activeLocale = locale ?? defaultLocale;
  
  // Validate that the incoming locale is supported
  const validLocale = locales.includes(activeLocale as Locale) ? activeLocale : defaultLocale;

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
