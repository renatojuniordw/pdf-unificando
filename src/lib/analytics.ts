const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID
const GA_API_SECRET = process.env.GA_API_SECRET

export async function trackProcessingEvent(
  tool: string,
  success: boolean,
  fileSizeBytes?: number
) {
  if (!GA_MEASUREMENT_ID || !GA_API_SECRET) return

  await fetch(
    `https://www.google-analytics.com/mp/collect?measurement_id=${GA_MEASUREMENT_ID}&api_secret=${GA_API_SECRET}`,
    {
      method: 'POST',
      body: JSON.stringify({
        client_id: 'server',
        events: [{
          name: success ? 'pdf_processed' : 'pdf_error',
          params: {
            tool,
            file_size_kb: fileSizeBytes ? Math.round(fileSizeBytes / 1024) : undefined,
          },
        }],
      }),
    }
  ).catch(() => {})
}
