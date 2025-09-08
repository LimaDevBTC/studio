import {getRequestConfig} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {locales} from '../src/config';

export default getRequestConfig(async ({requestLocale}) => {
  // Validate that the incoming `locale` parameter is valid
  const locale = await requestLocale;
  if (!locale || !locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
    locale,
  };
});
