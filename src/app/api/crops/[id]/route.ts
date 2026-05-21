import { NextResponse } from 'next/server';
import { CROPS } from '../../data';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  const crop = CROPS.find(c => c.id === resolvedParams.id);

  if (!crop) {
    return NextResponse.json({ error: 'Crop not found' }, { status: 404 });
  }

  return NextResponse.json(crop);
}
