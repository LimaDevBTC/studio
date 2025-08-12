
import {Pathnames} from 'next-intl/navigation';

export const locales = ['en', 'es', 'pt'] as const;

export const pathnames = {
  '/': '/',
  '/login': {
    en: '/login',
    es: '/iniciar-sesion',
    pt: '/login'
  },
  '/signup': {
    en: '/signup',
    es: '/registro',
    pt: '/cadastro'
  },
  '/dashboard': '/dashboard',
  '/dashboard/profile': '/dashboard/profile',
  '/dashboard/settings': '/dashboard/settings',
  '/dashboard/courses': '/dashboard/courses',
  '/dashboard/courses/[courseId]': '/dashboard/courses/[courseId]',
  '/dashboard/courses/[courseId]/lesson/[lessonId]': '/dashboard/courses/[courseId]/lesson/[lessonId]',
  '/dashboard/subscription': '/dashboard/subscription',
  '/dashboard/live': '/dashboard/live',

  '/admin/dashboard': '/admin/dashboard',
  '/admin/courses': '/admin/courses',
  '/admin/courses/[courseId]': '/admin/courses/[courseId]',
  '/admin/users': '/admin/users',
  '/admin/live': '/admin/live'
} satisfies Pathnames<typeof locales>;

// Use the default: `always`
export const localePrefix = undefined;

export type AppPathnames = keyof typeof pathnames;
