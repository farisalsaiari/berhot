export class MockNotificationService {
  private sent: any[] = [];
  async send(type: string, to: string, data: any) {
    this.sent.push({ type, to, data, sentAt: new Date() });
    return { id: `notif_mock_${Date.now()}`, status: 'sent' };
  }
  getSent() { return [...this.sent]; }
  clear() { this.sent.length = 0; }
}
