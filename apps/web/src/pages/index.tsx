import React, { useState, useMemo } from 'react';
import { useCustomers } from '../hooks/useCustomers';
import { useTransactions } from '../hooks/useTransactions';
import { RenderAgGrid } from '../components/RenderAgGrid';
import type { Customer } from '../hooks/useCustomers';

export const Dashboard: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const { customers, createCustomer } = useCustomers(searchTerm);
  const { transactions, createTransaction } = useTransactions(selectedCustomer?.id || '');
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [txAmount, setTxAmount] = useState('');
  const [txDesc, setTxDesc] = useState('');

  const currentSelectedCustomer = useMemo(() => {
    if (!selectedCustomer) return null;
    const customersArray = Array.isArray(customers) ? customers : [];
    return customersArray.find(c => c.id === selectedCustomer.id) || selectedCustomer;
  }, [customers, selectedCustomer]);

  const netMetrics = useMemo(() => {
    // FIX: Strictly checks if customers is a valid array before calling reduce
    const customersArray = Array.isArray(customers) ? customers : [];
    
    return customersArray.reduce((acc, curr) => {
      const bal = Number(curr?.currentBalance || 0);
      if (bal > 0) acc.youGet += bal;
      if (bal < 0) acc.youGive += Math.abs(bal);
      return acc;
    }, { youGive: 0, youGet: 0 });
  }, [customers]);


  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;
    await createCustomer({ name: newCustName, phone: newCustPhone });
    setNewCustName(''); setNewCustPhone('');
  };

  const handleAddTransaction = async (type: 'YOU_GAVE' | 'YOU_GOT') => {
    if (!selectedCustomer || !txAmount) return;
    await createTransaction({
      customerId: selectedCustomer.id,
      amount: parseFloat(txAmount),
      type,
      description: txDesc || 'Ledger Entry',
    });
    setTxAmount(''); setTxDesc('');
    // Change the updated finder to look into the safe verified array
    const customersArray = Array.isArray(customers) ? customers : [];
    const updated = customersArray.find(c => c.id === selectedCustomer.id);


    if (updated) setSelectedCustomer(updated);
  };
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#070913', color: '#F1F5F9', fontFamily: 'system-ui, sans-serif', paddingBottom: '40px', boxSizing: 'border-box', margin: 0, display: 'block' }}>
      <nav style={{ backgroundColor: '#0F1424', borderBottom: '1px solid #1E293B', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ height: '36px', width: '36px', background: 'linear-gradient(to top right, #10B981, #2DD4BF)', borderRadius: '8px', display: 'flex' }}>
            <span style={{ color: '#070913', fontWeight: 900, fontSize: '16px', margin: 'auto' }}>DL</span>
          </div>
          <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>Deepledger</h1>
        </div>
        <button onClick={() => { localStorage.removeItem('token'); window.location.reload(); }} style={{ backgroundColor: '#1E293B', border: '1px solid #334155', color: '#94A3B8', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}>Sign Out</button>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', width: '100%' }}>
          <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E293B', borderRadius: '16px', padding: '24px', flex: '1 1 280px', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Total You Will Get (+)</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 900, color: '#10B981' }}>
            ₹{netMetrics.youGet.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
          <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E293B', borderRadius: '16px', padding: '24px', flex: '1 1 280px', boxSizing: 'border-box' }}>
            <span style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 'bold', textTransform: 'uppercase' }}>Total You Will Give (-)</span>
            <h3 style={{ margin: '4px 0 0 0', fontSize: '28px', fontWeight: 900, color: '#EF4444' }}>
            ₹{netMetrics.youGive.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', width: '100%', alignItems: 'flex-start' }}>
          <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E293B', borderRadius: '16px', padding: '24px', flex: '2 1 500px', display: 'flex', flexDirection: 'column', gap: '20px', boxSizing: 'border-box' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '12px', borderBottom: '1px solid #1E293B', paddingBottom: '16px' }}>
              <input type="text" placeholder="🔍 Search profiles..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ backgroundColor: '#05070D', border: '1px solid #1E293B', borderRadius: '10px', padding: '8px 14px', fontSize: '13px', color: '#F1F5F9', outline: 'none' }} />
              <form onSubmit={handleAddCustomer} style={{ display: 'flex', gap: '6px' }}>
                <input type="text" placeholder="Name" required value={newCustName} onChange={e => setNewCustName(e.target.value)} style={{ width: '65px', backgroundColor: '#05070D', border: '1px solid #1E293B', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', color: '#FFF' }} />
                <input type="text" placeholder="Phone" required value={newCustPhone} onChange={e => setNewCustPhone(e.target.value)} style={{ width: '75px', backgroundColor: '#05070D', border: '1px solid #1E293B', borderRadius: '8px', padding: '6px 10px', fontSize: '12px', color: '#FFF' }} />
                <button type="submit" style={{ backgroundColor: '#10B981', border: 'none', borderRadius: '8px', color: '#070913', fontSize: '12px', fontWeight: 'bold', padding: '6px 12px', cursor: 'pointer' }}>+ Add</button>
              </form>
            </div>
            
            <RenderAgGrid rowData={Array.isArray(customers) ? customers : []} onCustomerSelect={setSelectedCustomer} />


          </div>
          <div style={{ backgroundColor: '#0F1424', border: '1px solid #1E293B', borderRadius: '16px', padding: '24px', flex: '1 1 340px', minHeight: '450px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            {currentSelectedCustomer ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', flex: 1, justifyContent: 'space-between' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#FFF' }}>{currentSelectedCustomer.name}</h2>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748B' }}>{currentSelectedCustomer.phone}</p>
                  <div style={{ backgroundColor: '#05070D', borderRadius: '12px', padding: '16px', marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid #1E293B' }}>
                    <span style={{ fontSize: '13px', color: '#94A3B8' }}>Net Standing Position</span>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: Number(currentSelectedCustomer.currentBalance) >= 0 ? '#10B981' : '#EF4444' }}>₹{Number(currentSelectedCustomer.currentBalance).toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto', maxHeight: '180px', margin: '12px 0', borderTop: '1px solid #1E293B', borderBottom: '1px solid #1E293B', padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {transactions.length === 0 ? (
                    <p style={{ textAlign: 'center', fontSize: '12px', color: '#475569', margin: 'auto' }}>No records found.</p>
                  ) : (
                    transactions.map((tx) => (
                      <div key={tx.id} style={{ backgroundColor: '#05070D', padding: '10px 14px', borderRadius: '10px', border: '1px solid #1E293B', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#E2E8F0' }}>{tx.description}</p>
                          <p style={{ margin: 0, fontSize: '10px', color: '#475569' }}>{new Date(tx.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span style={{ fontSize: '13px', fontWeight: 'bold', color: tx.type === 'YOU_GOT' ? '#10B981' : '#EF4444' }}>{tx.type === 'YOU_GOT' ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN')}</span>
                      </div>
                    ))
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <input type="number" placeholder="Amount" value={txAmount} onChange={e => setTxAmount(e.target.value)} style={{ backgroundColor: '#05070D', border: '1px solid #1E293B', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#FFF', outline: 'none', width: '50%' }} />
                    <input type="text" placeholder="Remarks" value={txDesc} onChange={e => setTxDesc(e.target.value)} style={{ backgroundColor: '#05070D', border: '1px solid #1E293B', borderRadius: '10px', padding: '10px', fontSize: '12px', color: '#FFF', outline: 'none', width: '50%' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button onClick={() => handleAddTransaction('YOU_GAVE')} style={{ backgroundColor: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: '10px', color: '#10B981', padding: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '50%' }}>YOU GAVE (+)</button>
                    <button onClick={() => handleAddTransaction('YOU_GOT')} style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', color: '#EF4444', padding: '12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: '50%' }}>YOU GOT (-)</button>
                  </div>
                </div>
              </div>
            ) : (
              <div style={{ margin: 'auto', textAlign: 'center', border: '2px dashed #1E293B', padding: '40px 20px', borderRadius: '16px', width: '80%' }}>
                <p style={{ color: '#64748B', fontSize: '13px', margin: 0 }}>Select a customer row from the matrix to open active ledger execution streams.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
