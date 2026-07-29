'use client';

import { useWidgetSDK } from '@nitrostack/widgets';

type DashboardData = {
  stores: Array<{ id: string; name: string; city: string; status: string }>;
  totals: {
    stores: number;
    activeStores: number;
    products: number;
    employees: number;
    sales: number;
    revenue: number;
    pendingTransfers: number;
  };
  lowStockItems: Array<{
    storeId: string;
    sku: string;
    quantity: number;
    product?: { name: string; reorderPoint: number };
  }>;
  recentSales: Array<{ id: string; total: number; soldAt: string }>;
};

const shell: React.CSSProperties = {
  padding: 24,
  minHeight: '100vh',
  background: 'radial-gradient(circle at top left, #fff2cc 0%, #f8fafc 40%, #e2e8f0 100%)',
  color: '#1f2937',
  fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
};

export default function StoreDashboardPage() {
  const { getToolOutput } = useWidgetSDK();
  const data = getToolOutput<DashboardData>();

  if (!data) {
    return <div style={shell}>Loading franchise dashboard...</div>;
  }

  const metricStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.84)',
    border: '1px solid rgba(15,23,42,0.08)',
    borderRadius: 18,
    padding: 18,
    boxShadow: '0 12px 30px rgba(15,23,42,0.08)',
  };

  return (
    <main style={shell}>
      <div style={{ maxWidth: 980, margin: '0 auto', display: 'grid', gap: 18 }}>
        <section style={{ ...metricStyle, background: 'linear-gradient(135deg, #0f172a, #1d4ed8)', color: '#f8fafc' }}>
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1.5, opacity: 0.72 }}>Franchise Overview</div>
          <h1 style={{ margin: '8px 0 10px', fontSize: 34 }}>Store Dashboard</h1>
          <p style={{ margin: 0, opacity: 0.86 }}>Live view of revenue, staffing, low-stock risk, and operational coverage.</p>
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          {[
            ['Revenue', `Rs ${data.totals.revenue.toLocaleString()}`],
            ['Stores', `${data.totals.activeStores}/${data.totals.stores} active`],
            ['Employees', `${data.totals.employees}`],
            ['Sales', `${data.totals.sales}`],
            ['Pending Transfers', `${data.totals.pendingTransfers}`],
          ].map(([label, value]) => (
            <article key={label} style={metricStyle}>
              <div style={{ fontSize: 13, color: '#64748b', textTransform: 'uppercase' }}>{label}</div>
              <div style={{ fontSize: 27, marginTop: 8, fontWeight: 700 }}>{value}</div>
            </article>
          ))}
        </section>

        <section style={{ display: 'grid', gridTemplateColumns: '1.25fr 0.95fr', gap: 16 }}>
          <article style={metricStyle}>
            <h2 style={{ marginTop: 0 }}>Stores</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.stores.map((store) => (
                <div key={store.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e2e8f0', paddingBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{store.name}</div>
                    <div style={{ fontSize: 13, color: '#64748b' }}>{store.city}</div>
                  </div>
                  <div style={{
                    alignSelf: 'center',
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: store.status === 'active' ? '#dcfce7' : '#fee2e2',
                    color: store.status === 'active' ? '#166534' : '#991b1b',
                    fontSize: 12,
                    textTransform: 'capitalize',
                  }}>
                    {store.status}
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article style={metricStyle}>
            <h2 style={{ marginTop: 0 }}>Low Stock Alerts</h2>
            <div style={{ display: 'grid', gap: 10 }}>
              {data.lowStockItems.length === 0 ? (
                <div>All tracked SKUs are healthy.</div>
              ) : data.lowStockItems.map((item) => (
                <div key={`${item.storeId}-${item.sku}`} style={{ padding: 12, borderRadius: 14, background: '#fff7ed' }}>
                  <div style={{ fontWeight: 700 }}>{item.product?.name ?? item.sku}</div>
                  <div style={{ fontSize: 13, color: '#9a3412' }}>
                    {item.quantity} units left, reorder point {item.product?.reorderPoint ?? '-'}
                  </div>
                </div>
              ))}
            </div>
          </article>
        </section>

        <section style={metricStyle}>
          <h2 style={{ marginTop: 0 }}>Recent Sales</h2>
          <div style={{ display: 'grid', gap: 10 }}>
            {data.recentSales.map((sale) => (
              <div key={sale.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #e2e8f0' }}>
                <span>{sale.id}</span>
                <span>{new Date(sale.soldAt).toLocaleString()}</span>
                <strong>Rs {sale.total.toLocaleString()}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
