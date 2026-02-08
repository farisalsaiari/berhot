export class MockPaymentGateway {
  async charge(amount: number, currency: string, method: string) {
    return { id: `pay_mock_${Date.now()}`, status: 'success', amount, currency };
  }
  async refund(paymentId: string, amount?: number) {
    return { id: `ref_mock_${Date.now()}`, status: 'success', paymentId, amount };
  }
}
