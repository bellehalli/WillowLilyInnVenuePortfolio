export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ verified: false, error: 'Method not allowed' });
  }

  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret || !secret.startsWith('sk_test_')) {
    return res.status(500).json({
      verified: false,
      error: 'Stripe TEST verification is not configured'
    });
  }

  const sessionId = String(req.query?.session_id || '').trim();

  if (!sessionId || !sessionId.startsWith('cs_test_')) {
    return res.status(400).json({
      verified: false,
      error: 'A valid Stripe TEST session_id is required'
    });
  }

  try {
    const response = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${secret}`
        }
      }
    );

    const session = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status === 404 ? 404 : 502).json({
        verified: false,
        error: session?.error?.message || 'Stripe TEST session could not be retrieved'
      });
    }

    if (session?.metadata?.portfolio_demo !== 'true') {
      return res.status(400).json({
        verified: false,
        error: 'This Checkout Session is not a Willow Lily portfolio demo session'
      });
    }

    if (session.payment_status !== 'paid') {
      return res.status(409).json({
        verified: false,
        error: 'Stripe TEST payment is not complete',
        paymentStatus: session.payment_status || 'unknown'
      });
    }

    return res.status(200).json({
      verified: true,
      id: session.id,
      paymentStatus: session.payment_status,
      amountTotal: Number(session.amount_total || 0) / 100,
      currency: session.currency || 'usd',
      weddingDate: session?.metadata?.wedding_date || '',
      mode: session.mode || 'payment'
    });
  } catch (error) {
    console.error('verify-checkout error', error);
    return res.status(500).json({
      verified: false,
      error: 'Stripe TEST verification is temporarily unavailable'
    });
  }
}
