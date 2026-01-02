import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8081/api/products';

function App() {
  const [products, setProducts] = useState([]);
  const [view, setView] = useState('all'); 
  const [formData, setFormData] = useState({ name: '', quantity: 0, price: 0 });
  const [editingId, setEditingId] = useState(null);
  
  // Modal States
  const [showSaleModal, setShowSaleModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [saleQuantity, setSaleQuantity] = useState(1);

  useEffect(() => { loadProducts(); }, [view]);

  const loadProducts = () => {
    const url = view === 'low' ? `${API_URL}/low-stock` : API_URL;
    axios.get(url).then(res => setProducts(res.data)).catch(err => console.log(err));
  };

  // স্টকের হিসাব বের করার জন্য লজিক
  const totalItems = products.length;
  const totalStockCount = products.reduce((sum, p) => sum + p.quantity, 0);
  const lowStockCount = products.filter(p => p.quantity < 5).length;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      axios.put(`${API_URL}/${editingId}`, formData).then(() => {
        setEditingId(null);
        resetForm();
      });
    } else {
      axios.post(API_URL, formData).then(() => resetForm());
    }
  };

  const resetForm = () => {
    setFormData({ name: '', quantity: 0, price: 0 });
    loadProducts();
  };

  const handleEdit = (p) => {
    setEditingId(p.id);
    setFormData({ name: p.name, quantity: p.quantity, price: p.price });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const confirmSale = () => {
    axios.put(`${API_URL}/${selectedProduct.id}/sell?amount=${saleQuantity}`)
      .then(() => {
        setShowSaleModal(false);
        loadProducts();
        alert("Transaction successful!");
      }).catch(() => alert("Error: Insufficient stock!"));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar */}
      <nav className="bg-indigo-700 text-white p-5 shadow-2xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-3xl font-black italic tracking-tighter">SMART-IMS</h1>
          <div className="space-x-4">
            <button onClick={() => setView('all')} className={`px-6 py-2 rounded-xl font-bold transition-all ${view==='all'?'bg-white text-indigo-700 shadow-md':'hover:bg-indigo-600'}`}>Inventory</button>
            <button onClick={() => setView('low')} className={`px-6 py-2 rounded-xl font-bold transition-all ${view==='low'?'bg-red-500 text-white shadow-md':'hover:bg-indigo-600'}`}>Low Stock</button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto p-6">
        
        {/* --- STOCK SUMMARY SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-indigo-500">
            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Total Products</p>
            <h3 className="text-4xl font-black text-slate-800">{totalItems}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-emerald-500">
            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Total Stock Quantity</p>
            <h3 className="text-4xl font-black text-slate-800">{totalStockCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-b-4 border-red-500">
            <p className="text-gray-500 font-bold uppercase text-xs mb-1">Low Stock Alerts</p>
            <h3 className="text-4xl font-black text-red-600">{lowStockCount}</h3>
          </div>
        </div>

        {/* Form Card */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-8 mb-10">
          <h2 className="text-2xl font-black mb-6 text-slate-800 flex items-center gap-2">
             {editingId ? '📝 Edit Product' : '🚀 Add to Inventory'}
          </h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input className="bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition font-semibold" placeholder="Item Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="number" className="bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition font-semibold" placeholder="Stock Amount" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} required />
            <input type="number" className="bg-slate-50 border-2 border-slate-50 p-4 rounded-2xl outline-none focus:border-indigo-500 transition font-semibold" placeholder="Price (BDT)" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} required />
            <button type="submit" className={`p-4 rounded-2xl font-black text-white shadow-xl transition transform active:scale-95 ${editingId ? 'bg-amber-500 shadow-amber-100' : 'bg-indigo-600 shadow-indigo-100'}`}>
              {editingId ? 'UPDATE PRODUCT' : 'SAVE ITEM'}
            </button>
          </form>
        </section>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map(p => (
            <div key={p.id} className="bg-white p-8 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-2xl transition-all duration-500 group">
              <div className="flex justify-between items-start mb-6">
                <h3 className="text-xl font-black text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition-colors">{p.name}</h3>
                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.quantity < 5 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                  {p.quantity < 5 ? 'Low Stock' : 'Stable'}
                </span>
              </div>
              <div className="text-4xl font-black text-slate-900 mb-2">৳{p.price.toLocaleString()}</div>
              <p className="text-slate-400 font-bold text-sm mb-8 italic">Available Stock: <span className={p.quantity < 5 ? 'text-red-500' : 'text-slate-700'}>{p.quantity} Units</span></p>
              
              <div className="flex gap-3">
                <button onClick={() => {setSelectedProduct(p); setSaleQuantity(1); setShowSaleModal(true);}} className="flex-1 bg-indigo-600 text-white py-4 rounded-2xl font-black hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">BUY</button>
                <button onClick={() => handleEdit(p)} className="bg-slate-100 text-slate-500 px-6 py-4 rounded-2xl hover:bg-amber-100 hover:text-amber-600 transition-all font-black">Edit</button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Sale Modal */}
      {showSaleModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[3rem] p-10 w-full max-w-sm shadow-2xl">
            <h3 className="text-3xl font-black mb-2 text-center text-slate-800">Checkout</h3>
            <p className="text-center text-slate-400 font-bold mb-8 italic">{selectedProduct?.name}</p>
            <div className="mb-8">
              <label className="text-[10px] font-black text-slate-400 block mb-2 text-center uppercase tracking-widest">Enter Quantity</label>
              <input type="number" min="1" max={selectedProduct?.quantity} value={saleQuantity} onChange={(e) => setSaleQuantity(parseInt(e.target.value))} className="w-full bg-slate-50 border-2 border-indigo-50 p-5 rounded-[2rem] text-center text-4xl font-black focus:border-indigo-600 outline-none transition" />
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={confirmSale} className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] font-black text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all">CONFIRM SALE</button>
              <button onClick={() => setShowSaleModal(false)} className="w-full py-4 font-black text-slate-400 hover:text-slate-600 transition-colors">Go Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;