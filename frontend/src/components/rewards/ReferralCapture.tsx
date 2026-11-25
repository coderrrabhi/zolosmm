import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { REF_STORAGE_KEY, captureReferralFromUrl } from '@/lib/rewards';

/** Remembers ?ref=CODE from any page so the referral survives until sign-up. */
export function ReferralCapture() {
  const { search } = useLocation();
  useEffect(() => { captureReferralFromUrl(search); }, [search]);
  return null;
}
export function RegisterRedirect() {
  const { search } = useLocation();
  captureReferralFromUrl(search);
  return <Navigate to="/auth?mode=signup" replace />;
}
/** Server validates and permanently locks the referrer; frontend only forwards the code. */
export async function claimPendingReferral() {
  let code: string | null = null;
  try { code = localStorage.getItem(REF_STORAGE_KEY); } catch { /* ignore */ }
  if (!code) return;
  const { data, error } = await (supabase.rpc as any)('claim_referral', { p_code: code });
  if (!error) { try { localStorage.removeItem(REF_STORAGE_KEY); } catch { /* ignore */ } }
  return data;
}
