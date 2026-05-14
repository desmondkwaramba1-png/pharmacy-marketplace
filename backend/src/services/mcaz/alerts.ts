/**
 * MCAZ Scraper Alert Service
 *
 * Fires alerts when the scraper encounters structural failures
 * (selector shift, zero-row pages, network errors).
 *
 * Configured via environment variables:
 *   SLACK_WEBHOOK_URL  — optional Slack incoming webhook
 */

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

export async function sendScraperAlert(target: string, message: string): Promise<void> {
  const text = `[MCAZ Scraper Alert] *${target}* — ${message}`;
  console.error(text);

  if (SLACK_WEBHOOK_URL) {
    try {
      await fetch(SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
    } catch (err) {
      console.error('[MCAZ alerts] Failed to send Slack webhook:', err);
    }
  }
}
