'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

type InventoryData = {
  lowStockCount: number;
  categoryTotals: Array<{ category: string; quantity: number }>;
  records: Array<{
    storeName: string;
    productName: string;
    category: string;
    quantity: number;
    reorderPoint: number;
    status: 'low' | 'healthy';
  }>;
};

export default function InventoryWidgetPage() {
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<InventoryData>();

  if (!data) {
    return <div style={{ padding: 24 }}>Loading inventory insights...</div>;
  }

  return (
    <main style={{
      padding: 24,
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #052e16 0%, #14532d 36%, #ecfccb 100%)',
      color: '#f7fee7',
      fontFamily: '"Trebuchet MS", "Gill Sans", sans-serif',
    }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 16 }}>
        <section style={{ background: 'rgba(3,7,18,0.24)', borderRadius: 20, padding: 20, backdropFilter: 'blur(8px)' }}>
          <div style={{ fontSize: 12, letterSpacing: 1.6, textTransform: 'uppercase', opacity: 0.75 }}>Inventory Control</div>
          <h1 style={{ margin: '8px 0' }}>Inventory Widget</h1>
          <p style={{ margin: 0 }}>Low stock alerts: <strong>{data.lowStockCount}</strong></p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.3fr', gap: 16 }}>
          <article style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 18 }}>
            <h2 style={{ marginTop: 0 }}>Category Totals</h2>
            {data.categoryTotals.map((entry) => (
              <div key={entry.category} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                  <span>{entry.category}</span>
                  <strong>{entry.quantity}</strong>
                </div>
                <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.15)', marginTop: 6 }}>
                  <div style={{
                    width: `${Math.min(100, entry.quantity)}%`,
                    height: '100%',
                    borderRadius: 999,
                    background: '#bef264',
                  }} />
                </div>
              </div>
            ))}
          </article>

          <article style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 18 }}>
            <h2 style={{ marginTop: 0 }}>Store Stock Health</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.records.map((record, index) => (
                <div key={`${record.storeName}-${record.productName}-${index}`} style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr 0.7fr 0.7fr',
                  gap: 10,
                  alignItems: 'center',
                  padding: 12,
                  borderRadius: 14,
                  background: record.status === 'low' ? 'rgba(254,240,138,0.18)' : 'rgba(255,255,255,0.08)',
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{record.productName}</div>
                    <div style={{ fontSize: 12, opacity: 0.8 }}>{record.storeName}</div>
                  </div>
                  <div style={{ textTransform: 'capitalize' }}>{record.category}</div>
                  <div>{record.quantity} units</div>
                  <div style={{ color: record.status === 'low' ? '#fde68a' : '#bbf7d0' }}>
                    {record.status === 'low' ? `Reorder at ${record.reorderPoint}` : 'Healthy'}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>
      </div>
    </main>
  );
}
