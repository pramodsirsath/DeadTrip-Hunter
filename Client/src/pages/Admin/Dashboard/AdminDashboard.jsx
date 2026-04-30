import React, { useState, useEffect } from 'react';
import { UserCheck, IndianRupee, CheckCircle, XCircle, FileText, Image as ImageIcon, RefreshCw, Users, CreditCard } from 'lucide-react';
import PageTransition from '../../../components/PageTransition/PageTransition';
import GlassCard from '../../../components/GlassCard/GlassCard';
import StatCard from '../../../components/StatCard/StatCard';
import SkeletonLoader from '../../../components/SkeletonLoader/SkeletonLoader';
import { useToast } from '../../../components/Toast/Toast';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('drivers');
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const fetchDrivers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/pending-drivers", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingDrivers(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:3000/admin/pending-withdrawals", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setPendingWithdrawals(await res.json());
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    await fetchDrivers();
    await fetchWithdrawals();
    setLoading(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const totalWithdrawalAmount = pendingWithdrawals.reduce((sum, wd) => sum + (wd.amount || 0), 0);

  const handleDriverAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/admin/approve-driver/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        toast(`Driver ${action}d successfully`, "success");
        fetchDrivers();
      } else {
        toast(`Failed to ${action} driver`, "error");
      }
    } catch (err) {
      toast("An error occurred", "error");
    }
  };

  const handleWithdrawalAction = async (id, action) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:3000/admin/approve-withdrawal/${id}`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        toast(`Withdrawal ${action}d successfully`, "success");
        fetchWithdrawals();
      } else {
        toast(`Failed to ${action} withdrawal`, "error");
      }
    } catch (err) {
      toast("An error occurred", "error");
    }
  };

  const getDocUrl = (filename) => filename ? `http://localhost:3000/uploads/${filename}` : null;

  return (
    <PageTransition>
      <div style={{
        minHeight: 'calc(100vh - 64px)',
        padding: '32px 16px',
        maxWidth: '1200px',
        margin: '0 auto',
      }}>
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px' }}>
            Admin <span className="gradient-text">Dashboard</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)' }}>Approve drivers and manage payouts</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <StatCard icon={<Users size={24} />} label="Pending Drivers" value={pendingDrivers.length} />
          <StatCard icon={<IndianRupee size={24} />} label="Pending Withdrawals" value={pendingWithdrawals.length} />
          <StatCard icon={<CreditCard size={24} />} label="Total Pending Payout" value={`₹${totalWithdrawalAmount.toLocaleString()}`} />
        </div>

        <div className="flex-wrap stack-mobile" style={{ display: 'flex', gap: '16px', marginBottom: '24px', alignItems: 'center' }}>
          <button 
            className={activeTab === 'drivers' ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => setActiveTab('drivers')}
          >
            <UserCheck size={18} /> Pending Drivers ({pendingDrivers.length})
          </button>
          <button 
            className={activeTab === 'withdrawals' ? 'btn btn-primary' : 'btn btn-ghost'}
            onClick={() => setActiveTab('withdrawals')}
          >
            <IndianRupee size={18} /> Pending Withdrawals ({pendingWithdrawals.length})
          </button>

          <button 
            onClick={fetchAllData} 
            className="btn btn-outline hide-mobile" 
            style={{ marginLeft: 'auto', padding: '8px 16px' }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
          
          <button 
            onClick={fetchAllData} 
            className="btn btn-outline hide-desktop" 
            style={{ padding: '8px 16px' }}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} /> Refresh
          </button>
        </div>

        <GlassCard>
          {loading ? (
            <SkeletonLoader rows={5} />
          ) : (
            <>
              {activeTab === 'drivers' && (
                <div>
                  {pendingDrivers.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No pending drivers found.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {pendingDrivers.map(driver => (
                        <div key={driver._id} style={{
                          padding: '20px', borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                            <div>
                              <h3 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '4px' }}>{driver.name}</h3>
                              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>{driver.email} | {driver.phone}</p>
                              <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>Truck: {driver.truckType} ({driver.truckNumber}) | License: {driver.licenseNumber}</p>
                            </div>
                            
                            <div className="flex-wrap stack-mobile" style={{ display: 'flex', gap: '8px' }}>
                              <button onClick={() => handleDriverAction(driver._id, 'approve')} className="btn btn-success" style={{ padding: '8px 16px' }}>
                                <CheckCircle size={16} /> Approve
                              </button>
                              <button onClick={() => handleDriverAction(driver._id, 'reject')} className="btn btn-danger" style={{ padding: '8px 16px' }}>
                                <XCircle size={16} /> Reject
                              </button>
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                            {driver.documents?.photo && (
                              <a href={getDocUrl(driver.documents.photo)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                                <ImageIcon size={16} /> View Photo
                              </a>
                            )}
                            {driver.documents?.rcBook && (
                              <a href={getDocUrl(driver.documents.rcBook)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                                <FileText size={16} /> View RC Book
                              </a>
                            )}
                            {driver.documents?.aadhar && (
                              <a href={getDocUrl(driver.documents.aadhar)} target="_blank" rel="noreferrer" className="btn btn-ghost" style={{ fontSize: '0.85rem' }}>
                                <FileText size={16} /> View Aadhar
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'withdrawals' && (
                <div>
                  {pendingWithdrawals.length === 0 ? (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px' }}>No pending withdrawals.</p>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {pendingWithdrawals.map(wd => (
                        <div key={wd._id} style={{
                          padding: '20px', borderRadius: 'var(--radius-md)',
                          background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)',
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'
                        }}>
                          <div>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: '700', color: 'var(--success)', marginBottom: '4px' }}>₹{wd.amount}</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '4px' }}>Driver: {wd.driverId?.name} ({wd.driverId?.phone})</p>
                            <p style={{ color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>UPI ID: <strong>{wd.upiId}</strong></p>
                          </div>
                          
                          <div className="flex-wrap stack-mobile" style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => handleWithdrawalAction(wd._id, 'approve')} className="btn btn-success" style={{ padding: '8px 16px' }}>
                              <CheckCircle size={16} /> Mark Paid
                            </button>
                            <button onClick={() => handleWithdrawalAction(wd._id, 'reject')} className="btn btn-danger" style={{ padding: '8px 16px' }}>
                              <XCircle size={16} /> Reject (Refund)
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </GlassCard>
      </div>
    </PageTransition>
  );
}
