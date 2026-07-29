'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

type TransferData = {
  transfers: Array<{
    id: string;
    fromStoreName: string;
    toStoreName: string;
    productName: string;
    quantity: number;
    status: 'pending' | 'received';
    createdAt: string;
    receivedAt?: string;
  }>;
};

export default function TransferTimelinePage() {
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<TransferData>();

  if (!data) {
    return <div style={{ padding: 24 }}>Loading transfer timeline...</div>;
  }

  return (
    <main style={{
      minHeight: '100vh',
      padding: 24,
      background: 'linear-gradient(135deg, #172554 0%, #1d4ed8 50%, #bfdbfe 100%)',
      color: '#eff6ff',
      fontFamily: 'Verdana, Geneva, sans-serif',
    }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>
        <section style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.78 }}>Stock Movement</div>
          <h1 style={{ margin: '8px 0' }}>Transfer Timeline</h1>
        </section>

        <div style={{ display: 'grid', gap: 14 }}>
          {data.transfers.map((transfer, index) => (
            <article key={transfer.id} style={{
              position: 'relative',
              padding: '18px 18px 18px 34px',
              borderRadius: 18,
              background: 'rgba(15,23,42,0.32)',
              border: '1px solid rgba(255,255,255,0.15)',
            }}>
              <div style={{
                position: 'absolute',
                left: 14,
                top: 22,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: transfer.status === 'received' ? '#86efac' : '#fcd34d',
                boxShadow: `0 0 0 6px ${transfer.status === 'received' ? 'rgba(134,239,172,0.18)' : 'rgba(252,211,77,0.16)'}`,
              }} />
              {index < data.transfers.length - 1 && (
                <div style={{
                  position: 'absolute',
                  left: 18,
                  top: 34,
                  bottom: -18,
                  width: 2,
                  background: 'rgba(191,219,254,0.24)',
                }} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 16 }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{transfer.productName} • {transfer.quantity} units</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    {transfer.fromStoreName} to {transfer.toStoreName}
                  </div>
                </div>
                <div style={{
                  padding: '4px 10px',
                  borderRadius: 999,
                  background: transfer.status === 'received' ? 'rgba(34,197,94,0.16)' : 'rgba(251,191,36,0.18)',
                  color: transfer.status === 'received' ? '#bbf7d0' : '#fde68a',
                  height: 'fit-content',
                  textTransform: 'capitalize',
                  fontSize: 12,
                }}>
                  {transfer.status}
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 12, opacity: 0.82 }}>
                Created {new Date(transfer.createdAt).toLocaleString()}
                {transfer.receivedAt ? ` • Received ${new Date(transfer.receivedAt).toLocaleString()}` : ''}
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
