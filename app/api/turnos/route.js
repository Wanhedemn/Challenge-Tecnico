import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase'; // Or we can use relative paths like '../../../lib/supabase' depending on the path aliases

export async function GET(request) {
  return NextResponse.json({ message: 'API de Turnos lista' });
}

export async function POST(request) {
  return NextResponse.json({ message: 'Reserva de turno recibida' });
}
