import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL ?? 'http://localhost:8000';

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const auth = req.headers.get('Authorization') ?? '';

  const res = await fetch(`${BACKEND_URL}/templates/${encodeURIComponent(id)}/standard-terms`, {
    headers: { Authorization: auth },
  });

  const text = await res.text();
  return new NextResponse(text, {
    status: res.status,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
