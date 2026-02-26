import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minProfit, setMinProfit] = useState('');
  const [minPercent, setMinPercent] = useState('');
  const [sortBy, setSortBy] = useState('percent');

  useEffect(() => { fetchOpportunities(); }, []);
  useEffect(() => { filterOpportunities(); }, [opportunities, minProfit, minPercent, sortBy]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .order('net_profit_percent', { ascending: false });
      if (error) throw error;
      setOpportunities(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filterOpportunities = () => {
    let filtered = [...opportunities];
    if (minProfit) filtered = filtered.filter(o => (o.net_profit_cents / 100) >= parseFloat(minProfit));
    if (minPercent) filtered = filtered.filter(o => o.net_profit_percent >= parseFloat(minPercent));
    if (sortBy === 'percent') filtered.sort((a, b) => b.net_profit_percent - a.net_profit_percent);
    if (sortBy === 'value') filtered.sort((a, b) => b.net_profit_cents - a.net_profit_cents);
    if (sortBy === 'recent') filtered.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
    setFilteredOpportunities(filtered);
  };

const getImageUrl = (opp) => {
  if (opp.image_url) return opp.image_url;
  return null;
};

  const getTierInfo = (percent) => {
    if (percent >= 30) return { color: '#7c3aed', bg: '#f3e8ff', label: '🏆 LENDÁRIO', border: '#7c3aed' };
    if (percent >= 20) return { color: '#16a34a', bg: '#dcfce7', label: '🔥 ÉPICO', border: '#16a34a' };
    if (percent >= 10) return { color: '#d97706', bg: '#fef3c7', label: '⚡ RARO', border: '#d97706' };
    return { color: '#64748b', bg: '#f1f5f9', label: '📦 COMUM', border: '#cbd5e1' };
  };

  const formatCurrency = (cents) =>
    (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  const formatTime = (dateString) => {
    const diff = Math.floor((new Date() - new Date(dateString)) / 60000);
    if (diff < 1) return 'agora mesmo';
    if (diff < 60) return `há ${diff} min`;
    if (diff < 1440) return `há ${Math.floor(diff / 60)}h`;
    return `há ${Math.floor(diff / 1440)}d`;
  };

  const totalOps = opportunities.length;
  const maxProfit = opportunities.length > 0 ? Math.max(...opportunities.map(o => o.net_profit_percent)) : 0;
  const totalValue = opportunities.reduce((sum, o) => sum + o.net_profit_cents, 0);
  const legendary = opportunities.filter(o => o.net_profit_percent >= 30).length;
  const epic = opportunities.filter(o => o.net_profit_percent >= 20 && o.net_profit_percent < 30).length;

  if (loading) return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ fontSize: 56 }}>👽</div>
      <p style={{ color: '#16a34a', fontWeight: 700, fontSize: 16 }}>Farejando oportunidades...</p>
      <div style={{ width: 200, height: 6, background: '#dcfce7', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: '70%', height: '100%', background: 'linear-gradient(90deg, #16a34a, #22c55e)', borderRadius: 99 }}></div>
      </div>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e74c3c' }}>Erro: {error}</p>
    </div>
  );

  return (
    <div style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #f8fafc 100%)', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: '#111827', padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ background: '#16a34a', borderRadius: 10, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👽</div>
          <div>
            <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: -0.5 }}>Sniffer</span>
            <span style={{ fontSize: 10, color: '#22c55e', display: 'block', marginTop: -2 }}>● ao vivo</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ background: '#1f2937', borderRadius: 20, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>{totalOps}</span>
            <span style={{ fontSize: 11, color: '#9ca3af' }}>oportunidades</span>
          </div>
          <span style={{ fontSize: 22, cursor: 'pointer' }}>🔔</span>
        </div>
      </div>

      {/* Banner XP / Stats */}
      <div style={{ background: '#111827', padding: '0 16px 16px' }}>
        <div style={{ background: 'linear-gradient(135deg, #14532d, #166534)', borderRadius: 16, padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#86efac', fontSize: 10, margin: 0 }}>🏆 Lendários</p>
              <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '2px 0 0' }}>{legendary}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#86efac', fontSize: 10, margin: 0 }}>🔥 Épicos</p>
              <p style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '2px 0 0' }}>{epic}</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#86efac', fontSize: 10, margin: 0 }}>📈 Maior %</p>
              <p style={{ color: '#4ade80', fontSize: 20, fontWeight: 800, margin: '2px 0 0' }}>{maxProfit.toFixed(1)}%</p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: '#86efac', fontSize: 10, margin: 0 }}>💰 Potencial</p>
              <p style={{ color: '#4ade80', fontSize: 16, fontWeight: 800, margin: '2px 0 0' }}>{formatCurrency(totalValue)}</p>
            </div>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 99, height: 6, overflow: 'hidden' }}>
            <div style={{ width: `${Math.min((legendary / Math.max(totalOps, 1)) * 100 * 5, 100)}%`, height: '100%', background: 'linear-gradient(90deg, #22c55e, #4ade80)', borderRadius: 99 }}></div>
          </div>
          <p style={{ color: '#86efac', fontSize: 10, margin: '4px 0 0', textAlign: 'right' }}>🔓 Nível Caçador de Deals</p>
        </div>
      </div>

      {/* Filtros */}
      <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            placeholder="💵 Mín. R$"
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          />
          <input
            type="number"
            placeholder="📈 Mín. %"
            value={minPercent}
            onChange={(e) => setMinPercent(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['percent', '🏅 % Lucro'], ['value', '💰 Valor'], ['recent', '🕐 Recente']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: sortBy === key ? '#111827' : '#fff', color: sortBy === key ? '#22c55e' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', transition: 'all 0.2s' }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Contador */}
      <p style={{ padding: '8px 14px 4px', fontSize: 12, color: '#94a3b8', margin: 0 }}>
        {filteredOpportunities.length} resultado{filteredOpportunities.length !== 1 ? 's' : ''} encontrado{filteredOpportunities.length !== 1 ? 's' : ''}
      </p>

      {/* Grid 2 colunas */}
      {filteredOpportunities.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔍</div>
          <p>Nenhuma oportunidade encontrada.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10, padding: '8px 12px 24px' }}>
          {filteredOpportunities.map((opp) => {
            const tier = getTierInfo(opp.net_profit_percent);
            const imageUrl = getImageUrl(opp);
            return (
              <div key={opp.id} style={{ background: '#fff', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', border: `1.5px solid ${tier.border}30` }}>

                {/* Imagem do produto */}
                <div style={{ position: 'relative', background: '#f8fafc', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {imageUrl ? (
                   <img
  src={imageUrl}
  alt={opp.amazon_title}
  style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
  onError={(e) => {
    if (e.target.src.includes('_AC_SL300_')) {
      // Tenta segundo formato
      e.target.src = `https://images.weserv.nl/?url=m.media-amazon.com/images/P/${opp.amazon_asin}.01._AC_SX300_.jpg&w=300&fit=contain&bg=white`;
    } else if (e.target.src.includes('_AC_SX300_')) {
      // Tenta terceiro formato
      e.target.src = `https://images.weserv.nl/?url=m.media-amazon.com/images/P/${opp.amazon_asin}.01._SL300_.jpg&w=300&fit=contain&bg=white`;
    } else {
      // Desiste e mostra fallback
      e.target.style.display = 'none';
      e.target.nextSibling.style.display = 'flex';
    }
  }}
/>
                  ) : null}
                  <div style={{ display: imageUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 36 }}>
                    📦
                  </div>
                  {/* Badge tier flutuante */}
                  <div style={{ position: 'absolute', top: 8, left: 8, background: tier.bg, borderRadius: 20, padding: '3px 8px', border: `1px solid ${tier.border}40` }}>
                    <span style={{ fontSize: 9, fontWeight: 800, color: tier.color }}>{tier.label}</span>
                  </div>
                  {/* Badge % flutuante */}
                  <div style={{ position: 'absolute', top: 8, right: 8, background: tier.color, borderRadius: 20, padding: '3px 8px' }}>
                    <span style={{ fontSize: 10, fontWeight: 800, color: '#fff' }}>{opp.net_profit_percent.toFixed(1)}%</span>
                  </div>
                </div>

                {/* Corpo */}
                <div style={{ padding: '10px 10px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>

                  {/* Título */}
                  <p style={{ fontSize: 11, color: '#475569', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 30 }}>
                    {opp.amazon_title}
                  </p>

                  {/* Preços */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderRadius: 10, padding: '6px 8px', marginBottom: 8 }}>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ fontSize: 9, color: '#94a3b8', margin: 0 }}>🅰️ Amazon</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>{formatCurrency(opp.amazon_price_cents)}</p>
                    </div>
                    <span style={{ color: '#22c55e', fontSize: 14, fontWeight: 900 }}>→</span>
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      <p style={{ fontSize: 9, color: '#94a3b8', margin: 0 }}>🛒 ML</p>
                      <p style={{ fontSize: 11, fontWeight: 700, color: '#1e293b', margin: '2px 0 0' }}>{formatCurrency(opp.ml_price_cents)}</p>
                    </div>
                  </div>

                  {/* Lucro */}
<div style={{ background: '#f0fdf4', borderRadius: 10, padding: '8px', marginBottom: 8, textAlign: 'center' }}>
  <p style={{ fontSize: 9, color: '#16a34a', margin: 0, fontWeight: 600 }}>LUCRO POTENCIAL</p>
  <p style={{ fontSize: 17, fontWeight: 900, color: '#15803d', margin: '2px 0 0' }}>
    {formatCurrency(opp.gross_profit_cents)}
  </p>
  <p style={{ fontSize: 9, color: '#94a3b8', margin: '3px 0 0' }}>
    taxa ML: -{formatCurrency(opp.fee_cents)} · {formatTime(opp.detected_at)}
  </p>
</div>
                </div>

                {/* Botões */}
                <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <a
                    href={opp.amazon_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: 'linear-gradient(135deg, #16a34a, #22c55e)', color: '#fff', textAlign: 'center', padding: '9px', borderRadius: 12, fontSize: 11, fontWeight: 800, textDecoration: 'none', boxShadow: '0 2px 8px rgba(22,163,74,0.35)' }}
                  >
                    🛍️ Comprar Amazon
                  </a>
                  <a
                    href={opp.ml_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ background: '#fff', color: '#1e293b', textAlign: 'center', padding: '9px', borderRadius: 12, fontSize: 11, fontWeight: 700, textDecoration: 'none', border: '1.5px solid #e2e8f0' }}
                  >
                    🏪 Ver no ML
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 0 32px', color: '#cbd5e1', fontSize: 11 }}>
        👽 Sniffer · farejando deals em tempo real
      </div>
    </div>
  );
}

export default App;