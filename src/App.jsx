import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase.js';

const CATEGORIAS = ["Todas","Eletrônicos","Cozinha","Moda","Casa","Esportes","Beleza","Bebês"];

function App() {
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [minProfit, setMinProfit] = useState('');
  const [minPercent, setMinPercent] = useState('');
  const [sortBy, setSortBy] = useState('percent');
  const [categoriaAtiva, setCategoriaAtiva] = useState('Todas');

  useEffect(() => { fetchOpportunities(); }, []);
  useEffect(() => { filterOpportunities(); }, [opportunities, minProfit, minPercent, sortBy]);

  const fetchOpportunities = async () => {
    try {
      const { data, error } = await supabase
        .from('arbitrage_opportunities')
        .select('*')
        .order('gross_profit_percent', { ascending: false });
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
    if (minProfit) filtered = filtered.filter(o => (o.gross_profit_cents / 100) >= parseFloat(minProfit));
    if (minPercent) filtered = filtered.filter(o => o.gross_profit_percent >= parseFloat(minPercent));
    if (sortBy === 'percent') filtered.sort((a, b) => b.gross_profit_percent - a.gross_profit_percent);
    if (sortBy === 'value') filtered.sort((a, b) => b.gross_profit_cents - a.gross_profit_cents);
    if (sortBy === 'recent') filtered.sort((a, b) => new Date(b.detected_at) - new Date(a.detected_at));
    setFilteredOpportunities(filtered);
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

  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '4px solid #8BC34A', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
      <p style={{ color: '#8BC34A', fontWeight: 700, fontSize: 16 }}>Buscando oportunidades...</p>
    </div>
  );

  if (error) return (
    <div style={{ minHeight: '100vh', background: '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p style={{ color: '#e74c3c' }}>Erro: {error}</p>
    </div>
  );

  return (
    <div style={{ background: '#F5F5F5', minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif", maxWidth: 480, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ background: '#8BC34A', padding: '40px 16px 16px', textAlign: 'center', position: 'sticky', top: 0, zIndex: 10 }}>
        <h1 style={{ margin: 0, fontSize: 34, fontWeight: 800, color: '#fff', letterSpacing: 1 }}>Prüfer</h1>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>{opportunities.length} oportunidades encontradas</p>
      </div>

      {/* Categorias */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e0e0e0', overflowX: 'auto', whiteSpace: 'nowrap', padding: '10px 12px' }}>
        {CATEGORIAS.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoriaAtiva(cat)}
            style={{
              display: 'inline-block', marginRight: 8, padding: '6px 14px',
              borderRadius: 20, border: categoriaAtiva === cat ? 'none' : '1px solid #ddd',
              background: categoriaAtiva === cat ? '#8BC34A' : '#f0f0f0',
              color: categoriaAtiva === cat ? '#fff' : '#555',
              fontWeight: categoriaAtiva === cat ? 700 : 500,
              fontSize: 12, cursor: 'pointer'
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ padding: '12px 12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="number"
            placeholder="💵 Lucro mín. R$"
            value={minProfit}
            onChange={(e) => setMinProfit(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
          />
          <input
            type="number"
            placeholder="📈 Lucro mín. %"
            value={minPercent}
            onChange={(e) => setMinPercent(e.target.value)}
            style={{ flex: 1, padding: '10px 12px', borderRadius: 12, border: '1.5px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#fff' }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {[['percent', '🏅 % Lucro'], ['value', '💰 Valor'], ['recent', '🕐 Recente']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => setSortBy(key)}
              style={{ flex: 1, padding: '7px 4px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 11, fontWeight: 600, background: sortBy === key ? '#8BC34A' : '#fff', color: sortBy === key ? '#fff' : '#64748b', boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}
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
          {filteredOpportunities.map((opp) => (
            <div key={opp.id} style={{ background: '#fff', borderRadius: 14, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column' }}>

              {/* Imagem */}
              <div style={{ background: '#f9f9f9', height: 130, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {opp.image_url ? (
                  <img
                    src={opp.image_url}
                    alt={opp.amazon_title}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', padding: 8 }}
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                ) : null}
                <div style={{ display: opp.image_url ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', fontSize: 36 }}>📦</div>

                {/* Badges flutuantes */}
                <div style={{ position: 'absolute', top: 6, left: 6, background: '#FF5722', borderRadius: 5, padding: '2px 6px' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>-{opp.amazon_discount_percent}% OFF</span>
                </div>
                <div style={{ position: 'absolute', top: 6, right: 6, background: '#8BC34A', borderRadius: 5, padding: '2px 6px' }}>
                  <span style={{ fontSize: 9, fontWeight: 800, color: '#fff' }}>+{opp.gross_profit_percent?.toFixed(0)}% lucro</span>
                </div>
              </div>

              {/* Corpo */}
              <div style={{ padding: '10px 10px 0', flex: 1, display: 'flex', flexDirection: 'column' }}>

                <p style={{ fontSize: 11, fontWeight: 600, color: '#222', margin: '0 0 8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: 30 }}>
                  {opp.amazon_title}
                </p>

                {/* Preços */}
                <div style={{ display: 'flex', alignItems: 'center', background: '#f9f9f9', borderRadius: 8, padding: '6px 8px', marginBottom: 8 }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 9, color: '#888', margin: 0 }}>Amazon</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#555', margin: '2px 0 0' }}>{formatCurrency(opp.amazon_price_cents)}</p>
                  </div>
                  <div style={{ width: 1, height: 30, background: '#e0e0e0' }} />
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <p style={{ fontSize: 9, color: '#888', margin: 0 }}>Mercado Livre</p>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#555', margin: '2px 0 0' }}>{formatCurrency(opp.ml_price_cents)}</p>
                  </div>
                </div>

                {/* Lucro */}
                <div style={{ background: '#F1F8E9', borderRadius: 8, padding: 8, marginBottom: 10, textAlign: 'center' }}>
                  <p style={{ fontSize: 9, color: '#558B2F', margin: 0, fontWeight: 600 }}>💰 Lucro líquido estimado</p>
                  <p style={{ fontSize: 15, fontWeight: 800, color: '#33691E', margin: '2px 0 0' }}>{formatCurrency(opp.gross_profit_cents)}</p>
                  <p style={{ fontSize: 9, color: '#94a3b8', margin: '2px 0 0' }}>{formatTime(opp.detected_at)}</p>
                </div>
              </div>

              {/* Botões */}
              <div style={{ padding: '0 10px 10px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                <a
                  href={opp.amazon_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#3D3D3D', color: '#fff', textAlign: 'center', padding: 9, borderRadius: 8, fontSize: 11, fontWeight: 800, textDecoration: 'none' }}
                >
                  🛒 Comprar na Amazon
                </a>
                <a
                  href={opp.ml_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ background: '#FFE600', color: '#000', textAlign: 'center', padding: 9, borderRadius: 8, fontSize: 11, fontWeight: 700, textDecoration: 'none' }}
                >
                  📦 Ver no Mercado Livre
                </a>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '0 0 32px', color: '#cbd5e1', fontSize: 11 }}>
        🟢 Prüfer · encontrando oportunidades em tempo real
      </div>

    </div>
  );
}

export default App;