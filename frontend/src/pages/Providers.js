import React, { useState, useEffect, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { providerAPI } from '../utils/api';
import { SERVICE_CATEGORIES, GZB_AREAS } from '../utils/constants';
import ProviderCard from '../components/ProviderCard';
import { useUser } from '../App';

export default function Providers() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    service: searchParams.get('service') || '',
    area: searchParams.get('area') || '',
  });

  const [inputSearch, setInputSearch] = useState(filters.search);
  const { user } = useUser();

  const fetchProviders = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.service) params.service = filters.service;
      if (filters.area) params.area = filters.area;

      const res = await providerAPI.getAll(params);
      setProviders(res.data.providers || []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProviders(); }, [fetchProviders]);

  const applyFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    const p = new URLSearchParams(searchParams);
    if (value) p.set(key, value); else p.delete(key);
    setSearchParams(p);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilter('search', inputSearch);
  };

  const clearFilters = () => {
    setFilters({ search: '', service: '', area: '' });
    setInputSearch('');
    setSearchParams({});
  };

  const hasFilters = filters.search || filters.service || filters.area;

  return (
    <div style={{ paddingTop: 64, minHeight: '100vh' }}>
      {/* Filter bar */}
      <div style={{
        background: 'white', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 64, zIndex: 100,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      }}>
        <div className="container" style={{ padding: '14px 20px' }}>
          <form onSubmit={handleSearchSubmit} style={{
            display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center',
          }}>
            {/* Search */}
            <div style={{ position: 'relative', flex: '1 1 200px', minWidth: 0 }}>
              <span style={{
                position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                fontSize: 15, color: 'var(--mid)',
              }}>🔍</span>
              <input
                value={inputSearch}
                onChange={(e) => setInputSearch(e.target.value)}
                placeholder="Search providers..."
                className="form-input"
                style={{ paddingLeft: 36, height: 40 }}
              />
            </div>

            {/* Service filter */}
            <select
              value={filters.service}
              onChange={(e) => applyFilter('service', e.target.value)}
              className="form-input"
              style={{ flex: '0 0 auto', width: 'auto', minWidth: 150, height: 40 }}
            >
              <option value="">All Services</option>
              {SERVICE_CATEGORIES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Area filter */}
            <select
              value={filters.area}
              onChange={(e) => applyFilter('area', e.target.value)}
              className="form-input"
              style={{ flex: '0 0 auto', width: 'auto', minWidth: 150, height: 40 }}
            >
              <option value="">All Areas</option>
              {GZB_AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>

            <button type="submit" className="btn btn-primary" style={{ height: 40 }}>
              Search
            </button>

            {hasFilters && (
              <button type="button" className="btn btn-ghost" style={{ height: 40 }}
                onClick={clearFilters}>
                Clear
              </button>
            )}
          </form>
        </div>
      </div>

      {user ? (
        <div className="container" style={{ padding: '18px 20px', marginTop: 12 }}>
          <div style={{
            background: '#ECFDF5', border: '1px solid #D1FAE5', borderRadius: 16,
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Logged in as {user.name}</div>
              <div style={{ fontSize: 13, color: 'var(--mid)' }}>
                Your profile details will be auto-filled when booking a service.
              </div>
            </div>
            <Link to="/profile" className="btn btn-ghost" style={{ whiteSpace: 'nowrap' }}>
              Edit profile
            </Link>
          </div>
        </div>
      ) : (
        <div className="container" style={{ padding: '18px 20px', marginTop: 12 }}>
          <div style={{
            background: '#FEF3C7', border: '1px solid #FDE68A', borderRadius: 16,
            padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Login to save your profile</div>
              <div style={{ fontSize: 13, color: 'var(--mid)' }}>
                Save your contact details once and auto-fill them during booking.
              </div>
            </div>
            <Link to="/login" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
              Login / Profile
            </Link>
          </div>
        </div>
      )}

      <div className="container" style={{ padding: '28px 20px' }}>
        {/* Result count */}
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginBottom: 24,
        }}>
          <div>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{providers.length}</span>
            <span style={{ color: 'var(--mid)', fontSize: 15 }}> providers found</span>
            {filters.service && (
              <span style={{ color: 'var(--mid)', fontSize: 14 }}> · {filters.service}</span>
            )}
            {filters.area && (
              <span style={{ color: 'var(--mid)', fontSize: 14 }}> in {filters.area}</span>
            )}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="spinner" />
          </div>
        ) : providers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🔍</div>
            <h3 style={{ fontFamily: 'var(--font-display)', marginBottom: 8 }}>No providers found</h3>
            <p style={{ color: 'var(--mid)', fontSize: 14 }}>
              Try adjusting your filters or{' '}
              <button onClick={clearFilters}
                style={{ color: 'var(--brand)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}>
                clear all filters
              </button>
            </p>
          </div>
        ) : (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 18,
            }}>
              {providers.map((p, i) => (
                <div key={p._id} style={{
                  animation: `fadeUp 0.3s ease both`,
                  animationDelay: `${Math.min(i * 0.05, 0.4)}s`,
                }}>
                  <ProviderCard provider={p} />
                </div>
              ))}
            </div>

          </>
        )}
      </div>

      <style>{`@keyframes fadeUp {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }`}</style>
    </div>
  );
}
