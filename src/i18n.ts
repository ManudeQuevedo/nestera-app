import fs from 'fs';
import path from 'path';
import { getRequestConfig } from 'next-intl/server';
import { locales, defaultLocale, Locale } from './config';

export default getRequestConfig(async ({ locale }) => {
  // Use provided locale or fall back to default
  const activeLocale = locale ?? defaultLocale;
  
  // Validate that the incoming locale is supported
  const validLocale = locales.includes(activeLocale as Locale) ? activeLocale : defaultLocale;

  // Manually read the file to avoid Webpack/Next.js JSON parsing issues
  const filePath = path.join(process.cwd(), 'messages', `${validLocale}.json`);
  const messages = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return {
    locale: validLocale,
    messages,
  };
});
