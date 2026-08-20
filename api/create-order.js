// Serverless API: Create Razorpay Order in INR
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { pack, amount, scans, userId, userEmail, userName } = req.body || {};

  if (!amount || !scans || !userId) {
    return res.status(400).json({ error: 'Missing required parameters (amount, scans, userId)' });
  }

  const rawKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_TRxsIkZPf05X3K';
  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || 'SJJlpBi2ejZTnDS838iUCGtu';

  // Strip possible label prefixes (e.g. "Key ", "Secret ", "Key: ", "Secret: ") & quotes & whitespace
  let keyId = String(rawKeyId).replace(/^(key[:\s]*)/i, '').trim().replace(/^["']|["']$/g, '');
  let keySecret = String(rawKeySecret).replace(/^(secret[:\s]*)/i, '').trim().replace(/^["']|["']$/g, '');

  // Auto-fix if Key ID and Key Secret were accidentally swapped in Vercel
  if (keySecret.startsWith('rzp_') && !keyId.startsWith('rzp_')) {
    const temp = keyId;
    keyId = keySecret;
    keySecret = temp;
  }

  if (!keyId.startsWith('rzp_')) {
    keyId = 'rzp_test_TRxsIkZPf05X3K';
  }
  if (!keySecret || keySecret.length < 10) {
    keySecret = 'SJJlpBi2ejZTnDS838iUCGtu';
  }

  try {
    const amountInPaise = Math.round(Number(amount) * 100);
    const receiptId = `rcpt_${Date.now()}_${userId.slice(0, 6)}`;

    const authHeader = 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64');

    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: {
          userId: String(userId),
          pack: String(pack || 'starter'),
          scans: String(scans),
          userEmail: String(userEmail || '')
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay Order creation error:', data);
      return res.status(response.status).json({
        error: data.error?.description || data.error?.message || data.error || 'Failed to create Razorpay order',
        details: data,
        debug: {
          keyId: keyId,
          keyIdLength: keyId.length,
          secretLength: keySecret.length,
          rawKeyIdProvided: !!process.env.RAZORPAY_KEY_ID,
          rawSecretProvided: !!process.env.RAZORPAY_KEY_SECRET
        }
      });
    }

    return res.status(200).json({
      orderId: data.id,
      amount: data.amount,
      currency: data.currency,
      keyId: keyId,
      pack: pack,
      scans: scans
    });
  } catch (err) {
    console.error('Server error creating Razorpay order:', err);
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
}
