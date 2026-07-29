'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

type SalesData = {
  totalsByStore: Array<{ storeName: string; total: number }>;
  sales: Array<{
    id: string;
    storeName: string;
    soldAt: string;
    total: number;
    items: Array<{ sku: string; quantity: number }>;
  }>;
};

export default function SalesDashboardPage() {
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<SalesData>();

  if (!data) {
    return <div style={{ padding: 24 }}>Loading sales dashboard...</div>;
  }

  return (
    <main style={{
      minHeight: '100vh',
      padding: 24,
      background: 'linear-gradient(180deg, #fff7ed 0%, #ffedd5 45%, #fed7aa 100%)',
      color: '#431407',
      fontFamily: '"Palatino Linotype", Palatino, serif',
    }}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 16 }}>
        <section style={{ padding: 22, borderRadius: 22, background: '#7c2d12', color: '#fff7ed' }}>
          <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: 1.4, opacity: 0.76 }}>Revenue Lens</div>
          <h1 style={{ margin: '8px 0' }}>Sales Dashboard</h1>
          <p style={{ margin: 0 }}>Transaction flow, revenue by store, and line-item activity.</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.1fr', gap: 16 }}>
          <article style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 18, padding: 18 }}>
            <h2 style={{ marginTop: 0 }}>Revenue by Store</h2>
            {data.totalsByStore.map((entry) => (
              <div key={entry.storeName} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{entry.storeName}</span>
                  <strong>Rs {entry.total.toLocaleString()}</strong>
                </div>
                <div style={{ marginTop: 7, height: 9, borderRadius: 999, background: '#fdba74' }}>
                  <div style={{
                    height: '100%',
                    width: `${Math.min(100, entry.total / 15)}%`,
                    borderRadius: 999,
                    background: '#c2410c',
                  }} />
                </div>
              </div>
            ))}
          </article>

          <article style={{ background: 'rgba(255,255,255,0.75)', borderRadius: 18, padding: 18 }}>
            <h2 style={{ marginTop: 0 }}>Recent Transactions</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.sales.map((sale) => (
                <div key={sale.id} style={{ padding: 12, borderRadius: 14, background: '#fff7ed' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                    <span>{sale.id}</span>
                    <span>Rs {sale.total.toLocaleString()}</span>
                  </div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>{sale.storeName} • {new Date(sale.soldAt).toLocaleString()}</div>
                  <div style={{ fontSize: 13, marginTop: 6 }}>
                    {sale.items.map((item) => `${item.sku} x${item.quantity}`).join(', ')}
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
