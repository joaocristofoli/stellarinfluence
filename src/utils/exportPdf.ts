import { MarketingStrategy, Company, channelTypeLabels, channelTypeIcons } from '@/types/marketing';

/**
 * Generates the HTML content for a marketing plan.
 * This is used both for export/print and for shareable links.
 */
export function generatePlanHtml(strategies: MarketingStrategy[], company?: Company | null): string {
  const companyName = company?.name || 'Planejamento de Marketing';
  const companyLocation = company?.city && company?.state
    ? `${company.city}, ${company.state}`
    : '';

  // Cores da empresa ou padrão
  const primaryColor = company?.primaryColor || '#8B2A9B';
  const secondaryColor = company?.secondaryColor || '#FFFFFF';
  const logoUrl = company?.logoUrl || null;

  // Calcular cor de texto baseada na cor primária (se escura, usa branco)
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  const rgb = hexToRgb(primaryColor);
  const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
  const textOnPrimary = luminance > 0.5 ? '#1f2937' : '#FFFFFF';

  // Gerar cor mais clara para backgrounds
  const lightenColor = (hex: string, percent: number) => {
    const r = hexToRgb(hex);
    return `rgba(${r.r}, ${r.g}, ${r.b}, ${percent})`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const totalBudget = strategies.reduce((sum, s) => sum + s.budget, 0);
  const plannedCount = strategies.filter(s => s.status === 'planned').length;
  const inProgressCount = strategies.filter(s => s.status === 'in_progress').length;
  const completedCount = strategies.filter(s => s.status === 'completed').length;

  const statusLabels = {
    planned: 'Planejado',
    in_progress: 'Em Andamento',
    completed: 'Concluído',
  };

  const statusColors = {
    planned: '#6b7280',
    in_progress: '#f59e0b',
    completed: '#10b981',
  };

  // Agrupar estratégias por canal
  const strategiesByChannel = strategies.reduce((acc, s) => {
    if (!acc[s.channelType]) acc[s.channelType] = [];
    acc[s.channelType].push(s);
    return acc;
  }, {} as Record<string, MarketingStrategy[]>);

  const channelSummary = Object.entries(strategiesByChannel).map(([channel, strats]) => ({
    channel,
    label: channelTypeLabels[channel as keyof typeof channelTypeLabels],
    icon: channelTypeIcons[channel as keyof typeof channelTypeIcons],
    count: strats.length,
    budget: strats.reduce((sum, s) => sum + s.budget, 0),
  })).sort((a, b) => b.budget - a.budget);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Planejamento de Marketing - ${companyName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    :root {
      --primary: ${primaryColor};
      --primary-light: ${lightenColor(primaryColor, 0.1)};
      --primary-lighter: ${lightenColor(primaryColor, 0.05)};
      --secondary: ${secondaryColor};
      --text-on-primary: ${textOnPrimary};
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; 
      padding: 0;
      margin: 0;
      color: #1f2937;
      line-height: 1.6;
      background: #f9fafb;
    }
    
    .cover {
      background: linear-gradient(135deg, var(--primary) 0%, ${lightenColor(primaryColor, 0.8)} 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      padding: 60px;
      page-break-after: always;
    }
    
    .cover-logo {
      width: 120px;
      height: 120px;
      border-radius: 24px;
      object-fit: cover;
      margin-bottom: 40px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      background: white;
    }
    
    .cover h1 {
      font-size: 48px;
      font-weight: 800;
      color: var(--text-on-primary);
      margin-bottom: 16px;
      letter-spacing: -1px;
    }
    
    .cover .subtitle {
      font-size: 20px;
      color: var(--text-on-primary);
      opacity: 0.9;
      margin-bottom: 8px;
    }
    
    .cover .location {
      font-size: 16px;
      color: var(--text-on-primary);
      opacity: 0.7;
    }
    
    .cover .date {
      position: absolute;
      bottom: 40px;
      font-size: 14px;
      color: var(--text-on-primary);
      opacity: 0.6;
    }
    
    .cover-stats {
      display: flex;
      gap: 40px;
      margin-top: 60px;
    }
    
    .cover-stat {
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 24px 32px;
      border-radius: 16px;
      min-width: 140px;
    }
    
    .cover-stat .value {
      font-size: 32px;
      font-weight: 800;
      color: var(--text-on-primary);
    }
    
    .cover-stat .label {
      font-size: 12px;
      color: var(--text-on-primary);
      opacity: 0.8;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 4px;
    }
    
    .page {
      padding: 40px 50px;
      background: white;
      min-height: 100vh;
    }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 2px solid var(--primary-lighter);
    }
    
    .page-header-left {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    
    .page-header-logo {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      object-fit: cover;
    }
    
    .page-header h2 {
      font-size: 24px;
      font-weight: 700;
      color: var(--primary);
    }
    
    .page-header .page-number {
      font-size: 12px;
      color: #9ca3af;
    }
    
    .section-title {
      font-size: 20px;
      font-weight: 700;
      color: #1f2937;
      margin: 32px 0 20px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    
    .section-icon {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: var(--primary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
    }
    
    /* Resumo por canal */
    .channel-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin-bottom: 40px;
    }
    
    .channel-card {
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 20px;
    }
    
    .channel-card-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 12px;
    }
    
    .channel-card-icon {
      font-size: 24px;
    }
    
    .channel-card-name {
      font-weight: 600;
      font-size: 14px;
      color: #374151;
    }
    
    .channel-card-budget {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary);
    }
    
    .channel-card-count {
      font-size: 12px;
      color: #6b7280;
    }
    
    /* Estratégias */
    .strategy { 
      page-break-inside: avoid;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 16px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }
    
    .strategy-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid #f3f4f6;
    }
    
    .strategy-channel-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--primary-lighter);
      color: var(--primary);
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-bottom: 8px;
    }
    
    .strategy-title { 
      font-size: 20px; 
      font-weight: 700;
      color: #1f2937;
    }
    
    .strategy-budget { 
      font-size: 24px; 
      font-weight: 800;
      color: var(--primary);
    }
    
    .strategy-status {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      margin-top: 8px;
    }
    
    .status-planned { background: #f3f4f6; color: #6b7280; }
    .status-in_progress { background: #fef3c7; color: #d97706; }
    .status-completed { background: #d1fae5; color: #059669; }
    
    .strategy-meta {
      display: flex;
      gap: 24px;
      margin-bottom: 20px;
      padding: 16px;
      background: #f9fafb;
      border-radius: 12px;
    }
    
    .strategy-meta-item {
      font-size: 14px;
    }
    
    .strategy-meta-item strong {
      color: #6b7280;
      font-weight: 500;
      display: block;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    
    .strategy-meta-item span {
      color: #1f2937;
      font-weight: 600;
    }
    
    .strategy-sections {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    
    .strategy-section {
      background: #fafafa;
      padding: 16px;
      border-radius: 10px;
      border-left: 3px solid var(--primary);
    }
    
    .strategy-section.full-width {
      grid-column: 1 / -1;
    }
    
    .strategy-section h4 {
      font-size: 11px;
      font-weight: 700;
      color: var(--primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 8px;
    }
    
    .strategy-section p {
      font-size: 14px;
      color: #4b5563;
      line-height: 1.6;
    }
    
    .connections-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .connection-tag {
      background: var(--primary-lighter);
      color: var(--primary);
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 500;
    }
    
    /* Footer */
    .footer {
      text-align: center;
      padding: 40px;
      color: #9ca3af;
      font-size: 12px;
      border-top: 1px solid #e5e7eb;
      margin-top: 40px;
    }
    
    .footer-brand {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      margin-bottom: 8px;
    }
    
    .footer-logo {
      width: 24px;
      height: 24px;
      border-radius: 6px;
    }
    
    @media print {
      body { background: white; }
      .page { box-shadow: none; }
      .cover { page-break-after: always; }
      .strategy { page-break-inside: avoid; }
    }
    
    @media (max-width: 768px) {
      .cover { padding: 30px; }
      .cover h1 { font-size: 32px; }
      .cover-stats { flex-direction: column; gap: 16px; }
      .page { padding: 20px; }
      .channel-grid { grid-template-columns: 1fr; }
      .strategy-sections { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <!-- Capa -->
  <div class="cover">
    ${logoUrl ? `<img src="${logoUrl}" alt="${companyName}" class="cover-logo">` : ''}
    <h1>${companyName}</h1>
    <p class="subtitle">Planejamento Estratégico de Marketing</p>
    ${companyLocation ? `<p class="location">📍 ${companyLocation}</p>` : ''}
    
    <div class="cover-stats">
      <div class="cover-stat">
        <div class="value">${strategies.length}</div>
        <div class="label">Estratégias</div>
      </div>
      <div class="cover-stat">
        <div class="value">${formatCurrency(totalBudget)}</div>
        <div class="label">Investimento</div>
      </div>
      <div class="cover-stat">
        <div class="value">${Object.keys(strategiesByChannel).length}</div>
        <div class="label">Canais</div>
      </div>
    </div>
    
    <p class="date">Gerado em ${new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}</p>
  </div>

  <!-- Página de Resumo -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${logoUrl ? `<img src="${logoUrl}" alt="" class="page-header-logo">` : ''}
        <h2>${companyName}</h2>
      </div>
      <span class="page-number">Resumo Executivo</span>
    </div>
    
    <div class="section-title">
      <div class="section-icon">📊</div>
      Visão Geral por Status
    </div>
    
    <div class="channel-grid">
      <div class="channel-card">
        <div class="channel-card-header">
          <span class="channel-card-icon">📋</span>
          <span class="channel-card-name">Planejado</span>
        </div>
        <div class="channel-card-budget">${plannedCount}</div>
        <div class="channel-card-count">estratégias</div>
      </div>
      <div class="channel-card">
        <div class="channel-card-header">
          <span class="channel-card-icon">⚡</span>
          <span class="channel-card-name">Em Andamento</span>
        </div>
        <div class="channel-card-budget">${inProgressCount}</div>
        <div class="channel-card-count">estratégias</div>
      </div>
      <div class="channel-card">
        <div class="channel-card-header">
          <span class="channel-card-icon">✅</span>
          <span class="channel-card-name">Concluído</span>
        </div>
        <div class="channel-card-budget">${completedCount}</div>
        <div class="channel-card-count">estratégias</div>
      </div>
    </div>
    
    <div class="section-title">
      <div class="section-icon">💰</div>
      Investimento por Canal
    </div>
    
    <div class="channel-grid">
      ${channelSummary.map(ch => `
        <div class="channel-card">
          <div class="channel-card-header">
            <span class="channel-card-icon">${ch.icon}</span>
            <span class="channel-card-name">${ch.label}</span>
          </div>
          <div class="channel-card-budget">${formatCurrency(ch.budget)}</div>
          <div class="channel-card-count">${ch.count} estratégia${ch.count > 1 ? 's' : ''}</div>
        </div>
      `).join('')}
    </div>
  </div>

  <!-- Páginas de Estratégias -->
  <div class="page">
    <div class="page-header">
      <div class="page-header-left">
        ${logoUrl ? `<img src="${logoUrl}" alt="" class="page-header-logo">` : ''}
        <h2>${companyName}</h2>
      </div>
      <span class="page-number">Estratégias Detalhadas</span>
    </div>

    ${strategies.map((strategy, index) => `
      <div class="strategy">
        <div class="strategy-header">
          <div>
            <div class="strategy-channel-badge">
              ${channelTypeIcons[strategy.channelType]} ${channelTypeLabels[strategy.channelType]}
            </div>
            <div class="strategy-title">${strategy.name}</div>
          </div>
          <div style="text-align: right;">
            <div class="strategy-budget">${formatCurrency(strategy.budget)}</div>
            <div class="strategy-status status-${strategy.status}">${statusLabels[strategy.status]}</div>
          </div>
        </div>
        
        <div class="strategy-meta">
          <div class="strategy-meta-item">
            <strong>Responsável</strong>
            <span>${strategy.responsible}</span>
          </div>
          <div class="strategy-meta-item">
            <strong>Quando</strong>
            <span>${strategy.whenToDo}</span>
          </div>
        </div>

        <div class="strategy-sections">
          <div class="strategy-section full-width">
            <h4>📝 Descrição</h4>
            <p>${strategy.description}</p>
          </div>

          <div class="strategy-section">
            <h4>🎯 Como fazer?</h4>
            <p>${strategy.howToDo}</p>
          </div>

          <div class="strategy-section">
            <h4>💡 Por que fazer?</h4>
            <p>${strategy.whyToDo}</p>
          </div>

          ${strategy.connections.length > 0 ? `
            <div class="strategy-section full-width">
              <h4>🔗 Conecta com</h4>
              <div class="connections-list">
                ${strategy.connections.map(id => {
    const connected = strategies.find(s => s.id === id);
    return connected ? `<span class="connection-tag">${connected.name}</span>` : '';
  }).filter(Boolean).join('')}
              </div>
            </div>
          ` : ''}
        </div>
      </div>
    `).join('')}

    <div class="footer">
      <div class="footer-brand">
        ${logoUrl ? `<img src="${logoUrl}" alt="" class="footer-logo">` : ''}
        <strong>${companyName}</strong>
      </div>
      <p>Documento gerado pelo Planejador de Marketing • ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Opens a new window with the marketing plan HTML and triggers print.
 */
export function exportToPdf(strategies: MarketingStrategy[], company?: Company | null) {
  const content = generatePlanHtml(strategies, company);

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(content);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
  }
}

