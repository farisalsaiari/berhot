const API_BASE = '/api';

interface PartnerApplicationData {
  fullName: string;
  email: string;
  company: string;
  phone: string;
  partnerType: 'referral' | 'integration';
}

interface PartnerApplicationResponse {
  success: boolean;
  message: string;
}

export async function submitPartnerApplication(
  data: PartnerApplicationData
): Promise<PartnerApplicationResponse> {
  const res = await fetch(`${API_BASE}/v1/partners/apply`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await res.json();

  if (!res.ok) {
    throw new Error(result.error || 'Failed to submit application');
  }

  return result as PartnerApplicationResponse;
}
