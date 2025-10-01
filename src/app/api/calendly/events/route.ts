import { NextRequest, NextResponse } from 'next/server';
import { CalendlyEvent } from '@/types/consultation';

// Configurar como rota dinâmica
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email é obrigatório' }, { status: 400 });
    }

    // SIMULAÇÃO: Em produção, aqui seria uma chamada real para a API do Calendly
    // Por enquanto, retornamos dados simulados para desenvolvimento
    
    console.log(`🔍 Verificando eventos do Calendly para: ${email}`);
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retornar eventos simulados (vazio por padrão)
    const events: CalendlyEvent[] = [];
    
    // Em produção, aqui seria:
    // const response = await fetch(`https://api.calendly.com/scheduled_events?user=${email}`, {
    //   headers: { 'Authorization': `Bearer ${process.env.CALENDLY_API_KEY}` }
    // });
    // const events = await response.json();

    return NextResponse.json(events);
  } catch (error) {
    console.error('Erro na API de eventos do Calendly:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
