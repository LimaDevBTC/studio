// This is a temporary file to redirect from the root to the default locale.
// In a real app, you would probably want to detect the user's locale and
// redirect them to the appropriate language.
import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}
