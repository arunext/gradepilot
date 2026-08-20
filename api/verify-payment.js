import crypto from 'crypto';

// Serverless API: Verify Razorpay Payment Signature & Credit User in Supabase
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    userId,
    scans,
    pack,
    amount
  } = req.body || {};

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId || !scans) {
    return res.status(400).json({ error: 'Missing required payment verification parameters' });
  }

  const rawKeySecret = process.env.RAZORPAY_KEY_SECRET || 'SJJlpBi2ejZTnDS838iUCGtu';
  const keySecret = String(rawKeySecret).trim().replace(/^["']|["']$/g, '');
  const supabaseUrl = (process.env.SUPABASE_URL || 'https://ofnvnkcwzxmbwavxdvtm.supabase.co').trim();
  const supabaseAnonKey = (process.env.SUPABASE_ANON_KEY || 'sb_publishable_2uZid037F0dWrwInQ7XXzg_uLNSoWU9').trim();

  try {
    // 1. Cryptographic HMAC SHA256 Signature Verification
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(body)
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('Invalid payment signature match');
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    // 2. Fetch User Profile from Supabase
    const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, {
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`
      }
    });

    const profiles = await profileRes.json();
    const currentProfile = Array.isArray(profiles) && profiles.length > 0 ? profiles[0] : null;

    const currentBalance = currentProfile?.credits_balance || 0;
    const scansToAdd = parseInt(scans, 10) || 50;
    const newBalance = currentBalance + scansToAdd;

    // 3. Update User's credits_balance in Supabase
    if (currentProfile) {
      await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}`, {
        method: 'PATCH',
        headers: {
          'apikey': supabaseAnonKey,
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation'
        },
        body: JSON.stringify({
          credits_balance: newBalance,
          updated_at: new Date().toISOString()
        })
      });
    }

    // 4. Log Transaction in credit_transactions table
    await fetch(`${supabaseUrl}/rest/v1/credit_transactions`, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${supabaseAnonKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: userId,
        amount: scansToAdd,
        type: 'purchase',
        description: `Purchased ${pack || 'Starter'} Pack (${scansToAdd} scans for ₹${amount || 49}) - Payment ID: ${razorpay_payment_id}`
      })
    });

    return res.status(200).json({
      ok: true,
      message: 'Payment verified and credits added successfully',
      scansAdded: scansToAdd,
      newBalance: newBalance,
      paymentId: razorpay_payment_id
    });
  } catch (err) {
    console.error('Payment verification server error:', err);
    return res.status(500).json({ error: err.message || 'Internal server error during verification' });
  }
}
