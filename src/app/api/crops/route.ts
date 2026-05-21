import { NextResponse } from 'next/server';
import { CROPS } from '../data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');

  let result = CROPS;
  if (category) {
    result = CROPS.filter(c => c.category === category);
  }

  return NextResponse.json(result);
}
