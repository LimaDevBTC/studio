import { Film } from "lucide-react";
import { Link } from '@/navigation';
import { useAuth } from "@/hooks/use-auth";

export function Logo() {
  const { user } = useAuth();
  
  // Se usuário estiver logado, logo não é clicável
  if (user) {
    return (
      <div className="flex items-center gap-2">
        <Film className="h-6 w-6 text-primary" />
        <span className="text-xl font-bold font-headline text-primary">MQM CRYPTO</span>
      </div>
    );
  }

  // Se usuário não estiver logado, logo é clicável
  return (
    <Link href="/" className="flex items-center gap-2" prefetch={false}>
      <Film className="h-6 w-6 text-primary" />
      <span className="text-xl font-bold font-headline text-primary">MQM CRYPTO</span>
    </Link>
  );
}
