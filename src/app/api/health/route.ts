import { binaryLimit, isOverloaded } from '@/lib/queue'

export async function GET() {
  return Response.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.round(process.uptime()),
    queue: {
      active: binaryLimit.activeCount,
      pending: binaryLimit.pendingCount,
      overloaded: isOverloaded(),
    },
  })
}
