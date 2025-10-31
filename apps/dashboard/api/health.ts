import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'wpupsell-api',
    version: '0.1.0'
  });
}
