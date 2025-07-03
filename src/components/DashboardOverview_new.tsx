import React from 'react';

const sidebarItems = [
  { label: 'Overview', icon: '🏠' },
  { label: 'Servers', icon: '🖥️' },
  { label: 'Plugins', icon: '🔌' },
  { label: 'Settings', icon: '⚙️' },
];

const DashboardOverview_new = () => {
  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <aside
        style={{
          width: 220,
          background: '#18181b',
          color: '#fff',
          padding: '2rem 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem',
          boxShadow: '2px 0 8px rgba(0,0,0,0.05)',
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 22, marginBottom: 32, letterSpacing: 1 }}>Pegasus</div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {sidebarItems.map((item) => (
            <div
              key={item.label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 16px',
                borderRadius: 8,
                cursor: 'pointer',
                transition: 'background 0.2s',
                fontWeight: 500,
                fontSize: 16,
                userSelect: 'none',
              }}
              onMouseOver={e => (e.currentTarget.style.background = '#27272a')}
              onMouseOut={e => (e.currentTarget.style.background = 'transparent')}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
      </aside>
      <main style={{ flex: 1, padding: '2rem' }}>
        <h2>Dashboard Overview</h2>
        {/* Main dashboard content goes here */}
      </main>
    </div>
  );
};

export default DashboardOverview_new;