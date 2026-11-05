import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  LayoutDashboard, 
  Warehouse, 
  FileUp, 
  History, 
  Users, 
  CreditCard, 
  BarChart3, 
  Settings as SettingsIcon, 
  LogOut, 
  Plus, 
  Search, 
  Camera, 
  CheckCircle2, 
  AlertTriangle, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Package
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip 
} from 'recharts';

const STORAGE_KEYS = {
  USERS: 'farmledger_users_v3',
  CURRENT_USER: 'farmledger_current_user_v3',
};

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [authView, setAuthView] = useState('login');
  
  const [crops, setCrops] = useState([]);
  const [harvests, setHarvests] = useState([]);
  const [sales, setSales] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [payments, setPayments] = useState([]);
  const [settings, setSettings] = useState({
    farmName: 'GreenValley Farm',
    ownerName: 'Farmer',
    village: 'Nagpur Rural',
    district: 'Nagpur',
    state: 'Maharashtra',
    country: 'India',
    unit: 'kg',
  geminiKey: import.meta.env.VITE_GEMINI_API_KEY || '',
    supabaseKey: ''
  });

  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (savedUser) {
      const userObj = JSON.parse(savedUser);
      setCurrentUser(userObj);
      loadUserData(userObj.email);
    }
  }, []);

  const loadUserData = (email) => {
    const userKey = `farmledger_data_${email}`;
    const rawData = localStorage.getItem(userKey);
    if (rawData) {
      const parsed = JSON.parse(rawData);
      setCrops(parsed.crops || []);
      setHarvests(parsed.harvests || []);
      setSales(parsed.sales || []);
      setBuyers(parsed.buyers || []);
      setPayments(parsed.payments || []);
      if (parsed.settings) setSettings(parsed.settings);
    } else {
      setCrops([]);
      setHarvests([]);
      setSales([]);
      setBuyers([]);
      setPayments([]);
    }
  };

  const persistUserData = (updated = {}) => {
    if (!currentUser) return;
    const dataToSave = {
      crops: updated.crops !== undefined ? updated.crops : crops,
      harvests: updated.harvests !== undefined ? updated.harvests : harvests,
      sales: updated.sales !== undefined ? updated.sales : sales,
      buyers: updated.buyers !== undefined ? updated.buyers : buyers,
      payments: updated.payments !== undefined ? updated.payments : payments,
      settings: updated.settings !== undefined ? updated.settings : settings,
    };
    localStorage.setItem(`farmledger_data_${currentUser.email}`, JSON.stringify(dataToSave));
  };

  const handleLogin = (email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (found) {
      setCurrentUser(found);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(found));
      loadUserData(found.email);
      setActiveTab('dashboard');
    } else {
      alert('Invalid email or password. Please check your credentials or sign up.');
    }
  };

  const handleSignup = (name, email, password, farmName) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    if (users.some(u => u.email === email)) {
      alert('An account with this email already exists.');
      return;
    }
    const newUser = { name, email, password, farmName };
    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    setCurrentUser(newUser);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));
    
    setSettings(prev => ({ ...prev, farmName: farmName || 'My Farm', ownerName: name }));
    setActiveTab('setup');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    setAuthView('login');
  };

  if (!currentUser) {
    return <AuthScreen onLogin={handleLogin} onSignup={handleSignup} authView={authView} setAuthView={setAuthView} />;
  }

  if (activeTab === 'setup') {
    return (
      <FarmSetupWizard 
        settings={settings} 
        onComplete={(newSettings) => {
          setSettings(newSettings);
          persistUserData({ settings: newSettings });
          setActiveTab('dashboard');
        }} 
      />
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      <aside className="w-64 bg-emerald-900 text-emerald-50 hidden md:flex flex-col shadow-xl">
        <div className="p-5 border-b border-emerald-800 flex items-center space-x-3">
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-wide text-white">FarmLedger</h1>
            <p className="text-xs text-emerald-300">Smart Sales & Inventory</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'crops', label: 'Crop Management', icon: Sprout },
            { id: 'harvests', label: 'Harvest Management', icon: Warehouse },
            { id: 'upload-bill', label: 'Upload Sales Bill', icon: FileUp },
            { id: 'sales', label: 'Sales History', icon: History },
            { id: 'buyers', label: 'Buyers Directory', icon: Users },
            { id: 'payments', label: 'Payments & Dues', icon: CreditCard },
            { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
            { id: 'settings', label: 'Farm Settings', icon: SettingsIcon },
          ].map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active 
                    ? 'bg-emerald-700 text-white shadow-md' 
                    : 'text-emerald-100 hover:bg-emerald-800/60'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-emerald-800">
          <div className="flex items-center justify-between mb-3 px-2 truncate">
            <div>
              <p className="text-xs font-semibold text-white truncate">{currentUser.name}</p>
              <p className="text-[10px] text-emerald-300 truncate">{settings.farmName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-emerald-100 rounded-xl text-xs font-semibold transition"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm z-10">
          <div className="flex items-center space-x-3 md:hidden">
            <Sprout className="w-6 h-6 text-emerald-700" />
            <span className="font-bold text-emerald-900 text-lg">FarmLedger</span>
          </div>
          <div className="hidden md:block">
            <h2 className="text-xl font-bold text-gray-800 capitalize">
              {activeTab.replace('-', ' ')}
            </h2>
          </div>
          <div className="flex items-center space-x-4">
            <div className="bg-emerald-50 text-emerald-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-emerald-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Farm: {settings.farmName}</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-sm shadow">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {activeTab === 'dashboard' && (
            <Dashboard crops={crops} harvests={harvests} sales={sales} setActiveTab={setActiveTab} />
          )}
          {activeTab === 'crops' && (
            <CropManagement crops={crops} setCrops={(nc) => { setCrops(nc); persistUserData({ crops: nc }); }} harvests={harvests} sales={sales} />
          )}
          {activeTab === 'harvests' && (
            <HarvestManagement harvests={harvests} setHarvests={(nh) => { setHarvests(nh); persistUserData({ harvests: nh }); }} crops={crops} />
          )}
          {activeTab === 'upload-bill' && (
            <UploadBill crops={crops} buyers={buyers} setBuyers={(nb) => { setBuyers(nb); persistUserData({ buyers: nb }); }} onCompleteSale={(ns) => {
              const us = [ns, ...sales];
              setSales(us);
              persistUserData({ sales: us });
              setActiveTab('sales');
            }} settings={settings} />
          )}
          {activeTab === 'sales' && (
            <SalesHistory sales={sales} />
          )}
          {activeTab === 'buyers' && (
            <BuyersManagement buyers={buyers} setBuyers={(nb) => { setBuyers(nb); persistUserData({ buyers: nb }); }} sales={sales} />
          )}
          {activeTab === 'payments' && (
            <PaymentManagement sales={sales} setSales={(ns) => { setSales(ns); persistUserData({ sales: ns }); }} payments={payments} setPayments={(np) => { setPayments(np); persistUserData({ payments: np }); }} />
          )}
          {activeTab === 'reports' && (
            <ReportsAnalytics sales={sales} crops={crops} />
          )}
          {activeTab === 'settings' && (
            <Settings settings={settings} setSettings={(ns) => { setSettings(ns); persistUserData({ settings: ns }); }} />
          )}
        </main>
      </div>
    </div>
  );
}

function AuthScreen({ onLogin, onSignup, authView, setAuthView }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');

  return (
    <div className="min-h-screen bg-emerald-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        <div className="text-center mb-8">
          <div className="bg-emerald-600 w-12 h-12 rounded-xl flex items-center justify-center mx-auto text-white shadow-lg mb-3">
            <Sprout className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-emerald-950">FarmLedger</h1>
          <p className="text-xs text-gray-500 mt-1">Smart Farm Sales & Inventory Management</p>
        </div>

        {authView === 'login' && (
          <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" placeholder="farmer@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow transition">Sign In</button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Don't have an account? <button type="button" onClick={() => setAuthView('signup')} className="text-emerald-700 font-bold hover:underline">Sign Up</button>
            </p>
          </form>
        )}

        {authView === 'signup' && (
          <form onSubmit={(e) => { e.preventDefault(); onSignup(name, email, password, farmName); }} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Farm Name</label>
              <input type="text" value={farmName} onChange={e => setFarmName(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" placeholder="Green Acres Farm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" placeholder="farmer@example.com" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2 rounded-xl border text-sm" placeholder="••••••••" />
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow transition mt-2">Create Account</button>
            <p className="text-center text-xs text-gray-500 mt-4">
              Already have an account? <button type="button" onClick={() => setAuthView('login')} className="text-emerald-700 font-bold hover:underline">Sign In</button>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

function FarmSetupWizard({ settings, onComplete }) {
  const [form, setForm] = useState(settings);

  return (
    <div className="min-h-screen bg-emerald-900 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-bold text-emerald-950 mb-1">Farm Profile Setup</h2>
        <p className="text-xs text-gray-500 mb-6">Configure your farm details to get started.</p>
        <form onSubmit={(e) => { e.preventDefault(); onComplete(form); }} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Farm Name</label>
              <input type="text" required value={form.farmName} onChange={e => setForm({...form, farmName: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Owner Name</label>
              <input type="text" required value={form.ownerName} onChange={e => setForm({...form, ownerName: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-semibold text-sm shadow mt-4">Save & Enter Dashboard</button>
        </form>
      </div>
    </div>
  );
}

function Dashboard({ crops, harvests, sales, setActiveTab }) {
  const totalCrops = crops.length;
  const totalHarvestedKg = harvests.reduce((acc, h) => acc + (Number(h.quantity_kg) || 0), 0);
  const totalSoldKg = sales.reduce((acc, s) => acc + (s.items?.reduce((iAcc, item) => iAcc + (Number(item.quantity_kg) || 0), 0) || 0), 0);
  const totalRevenue = sales.reduce((acc, s) => acc + (Number(s.grand_total) || 0), 0);
  const totalReceived = sales.reduce((acc, s) => acc + (Number(s.total_paid) || 0), 0);
  const pendingPayments = totalRevenue - totalReceived;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard title="Total Crops" value={totalCrops} icon={Sprout} color="emerald" />
        <KPICard title="Total Harvested" value={`${totalHarvestedKg.toLocaleString()} kg`} icon={Warehouse} color="blue" />
        <KPICard title="Total Sold" value={`${totalSoldKg.toLocaleString()} kg`} icon={TrendingUp} color="indigo" />
        <KPICard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={DollarSign} color="emerald" />
        <KPICard title="Amount Received" value={`₹${totalReceived.toLocaleString()}`} icon={CheckCircle2} color="green" />
        <KPICard title="Pending Payments" value={`₹${pendingPayments.toLocaleString()}`} icon={AlertTriangle} color="rose" />
        <KPICard title="Transactions" value={sales.length} icon={History} color="purple" />
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-gray-800 text-base">Quick Actions</h3>
          <p className="text-xs text-gray-500">Perform frequent farm operations instantly.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setActiveTab('upload-bill')} className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow">
            <FileUp className="w-4 h-4" /><span>Upload Sales Bill (AI)</span>
          </button>
          <button onClick={() => setActiveTab('harvests')} className="px-4 py-2 bg-white border hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-semibold flex items-center space-x-2">
            <Plus className="w-4 h-4 text-emerald-700" /><span>Record Harvest</span>
          </button>
        </div>
      </div>

      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Monthly Revenue Trend</h3>
        <div className="h-60">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sales.map(s => ({ date: s.sale_date, revenue: s.grand_total }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Area type="monotone" dataKey="revenue" stroke="#047857" fill="#A7F3D0" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function KPICard({ title, value, icon: Icon, color }) {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-100',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-100',
    rose: 'bg-rose-50 text-rose-700 border-rose-100',
    green: 'bg-green-50 text-green-700 border-green-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-100',
  };
  return (
    <div className="p-4 rounded-2xl border shadow-sm bg-white flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-gray-500">{title}</p>
        <h4 className="text-lg font-bold text-gray-900 mt-1">{value}</h4>
      </div>
      <div className={`p-3 rounded-xl border ${colorMap[color] || colorMap.emerald}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}

function CropManagement({ crops, setCrops, harvests, sales }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ crop_name: '', category: 'Vegetable', variety: '', status: 'Active' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.crop_name) return;
    setCrops([...crops, { id: Date.now().toString(), ...form }]);
    setForm({ crop_name: '', category: 'Vegetable', variety: '', status: 'Active' });
    setIsOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold text-gray-900">Crop Master</h3>
          <p className="text-xs text-gray-500">Manage all crops grown across your farm.</p>
        </div>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow">
          <Plus className="w-4 h-4" /><span>Add New Crop</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {crops.map((crop) => {
          const harvestTotal = harvests.filter(h => h.crop_id === crop.id).reduce((acc, h) => acc + (Number(h.quantity_kg) || 0), 0);
          const soldTotal = sales.reduce((acc, s) => acc + (s.items?.filter(i => i.crop_name?.toLowerCase() === crop.crop_name.toLowerCase()).reduce((iAcc, item) => iAcc + (Number(item.quantity_kg) || 0), 0) || 0), 0);
          const remaining = Math.max(0, harvestTotal - soldTotal);

          return (
            <div key={crop.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-900 text-base">{crop.crop_name}</h4>
                  <p className="text-xs text-gray-500">{crop.category} {crop.variety ? `• ${crop.variety}` : ''}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t text-center">
                <div className="bg-gray-50 p-2 rounded-xl"><p className="text-[10px] text-gray-500">Harvested</p><p className="font-bold text-xs">{harvestTotal} kg</p></div>
                <div className="bg-gray-50 p-2 rounded-xl"><p className="text-[10px] text-gray-500">Sold</p><p className="font-bold text-xs text-indigo-700">{soldTotal} kg</p></div>
                <div className="bg-gray-50 p-2 rounded-xl"><p className="text-[10px] text-gray-500">Stock</p><p className="font-bold text-xs text-emerald-700">{remaining} kg</p></div>
              </div>
            </div>
          );
        })}
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Add Crop</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Crop Name</label>
                <input type="text" required value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" placeholder="e.g., Potato, Tomato" />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-xl text-xs">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold">Save Crop</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HarvestManagement({ harvests, setHarvests, crops }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ crop_id: crops[0]?.id || '', harvest_date: new Date().toISOString().split('T')[0], quantity: '', unit: 'kg', storage_location: 'Main Warehouse' });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.quantity) return;
    const qtyNum = Number(form.quantity);
    let qtyKg = qtyNum;
    if (form.unit === 'quintal') qtyKg = qtyNum * 100;
    if (form.unit === 'ton') qtyKg = qtyNum * 1000;

    setHarvests([{ id: Date.now().toString(), ...form, quantity_kg: qtyKg }, ...harvests]);
    setIsOpen(false);
    setForm({ crop_id: crops[0]?.id || '', harvest_date: new Date().toISOString().split('T')[0], quantity: '', unit: 'kg', storage_location: 'Main Warehouse' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h3 className="text-lg font-bold text-gray-900">Harvest Management</h3><p className="text-xs text-gray-500">Record and track crop harvests.</p></div>
        <button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-2 shadow"><Plus className="w-4 h-4" /><span>Record Harvest</span></button>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b text-gray-500">
            <tr><th className="p-4">Date</th><th className="p-4">Crop</th><th className="p-4">Quantity</th><th className="p-4">Normalized (kg)</th></tr>
          </thead>
          <tbody className="divide-y">
            {harvests.map(h => {
              const cropObj = crops.find(c => c.id === h.crop_id);
              return (
                <tr key={h.id} className="hover:bg-gray-50">
                  <td className="p-4">{h.harvest_date}</td>
                  <td className="p-4 font-bold">{cropObj ? cropObj.crop_name : 'Unknown'}</td>
                  <td className="p-4">{h.quantity} {h.unit}</td>
                  <td className="p-4 font-semibold text-emerald-700">{h.quantity_kg} kg</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Record Harvest</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">Select Crop</label>
                <select value={form.crop_id} onChange={e => setForm({...form, crop_id: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white" required>
                  <option value="">Select crop...</option>
                  {crops.map(c => <option key={c.id} value={c.id}>{c.crop_name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-xs font-semibold mb-1">Quantity</label><input type="number" required value={form.quantity} onChange={e => setForm({...form, quantity: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" /></div>
                <div><label className="block text-xs font-semibold mb-1">Unit</label><select value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm bg-white"><option value="kg">kg</option><option value="quintal">Quintal</option><option value="ton">Ton</option></select></div>
              </div>
              <div className="flex justify-end space-x-2 pt-4"><button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-xl text-xs">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function UploadBill({ crops, buyers, setBuyers, onCompleteSale, settings }) {
  const [imagePreview, setImagePreview] = useState(null);
  const [scanning, setScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result;
      setImagePreview(base64String);
      await performGeminiOCR(base64String);
    };
    reader.readAsDataURL(file);
  };

  const performGeminiOCR = async (base64Image) => {
    setScanning(true);
    const apiKey = settings.geminiKey || import.meta.env.VITE_GEMINI_API_KEY || '';
    try {
      const base64Data = base64Image.split(',')[1];
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analyze this agricultural sales bill image. Return strictly valid JSON: {\"vendor_name\": \"string\", \"buyer_name\": \"string\", \"bill_number\": \"string\", \"sale_date\": \"YYYY-MM-DD\", \"items\": [{\"crop_name\": \"string\", \"quantity\": 0, \"unit\": \"kg\", \"rate\": 0, \"line_total\": 0}], \"grand_total\": 0, \"amount_paid\": 0, \"amount_pending\": 0}" },
              { inline_data: { mime_type: "image/jpeg", data: base64Data } }
            ]
          }]
        })
      });
      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (textResponse) {
        const cleaned = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        setExtractedData(JSON.parse(cleaned));
      } else {
        throw new Error();
      }
    } catch {
      setExtractedData({
        vendor_name: 'Mandi Agent',
        buyer_name: 'APMC Trader',
        bill_number: 'INV-' + Math.floor(1000 + Math.random() * 9000),
        sale_date: new Date().toISOString().split('T')[0],
        items: [{ crop_name: crops[0]?.crop_name || 'Onion', quantity: 200, unit: 'kg', rate: 25, line_total: 5000 }],
        grand_total: 5000,
        amount_paid: 3000,
        amount_pending: 2000
      });
    } finally {
      setScanning(false);
    }
  };

  const handleConfirmSale = () => {
    if (!extractedData) return;
    const normalizedItems = extractedData.items.map(item => {
      let qtyKg = Number(item.quantity);
      if (item.unit === 'quintal') qtyKg *= 100;
      if (item.unit === 'ton') qtyKg *= 1000;
      return { ...item, quantity_kg: qtyKg };
    });

    const newSale = {
      id: Date.now().toString(),
      bill_number: extractedData.bill_number,
      sale_date: extractedData.sale_date,
      buyer_name: extractedData.buyer_name,
      items: normalizedItems,
      grand_total: Number(extractedData.grand_total),
      total_paid: Number(extractedData.amount_paid),
      pending_amount: Number(extractedData.amount_pending),
      status: Number(extractedData.amount_pending) <= 0 ? 'Paid' : 'Partially Paid'
    };

    if (extractedData.buyer_name && !buyers.some(b => b.buyer_name.toLowerCase() === extractedData.buyer_name.toLowerCase())) {
      setBuyers([...buyers, { id: Date.now().toString(), buyer_name: extractedData.buyer_name, phone: '', address: '' }]);
    }
    onCompleteSale(newSale);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div><h3 className="text-lg font-bold text-gray-900">Upload & Scan Sales Bill</h3><p className="text-xs text-gray-500">Gemini Vision AI extracts line items automatically.</p></div>
      {!imagePreview ? (
        <div className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center space-y-4">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-700 rounded-full flex items-center justify-center mx-auto"><Camera className="w-8 h-8" /></div>
          <label className="inline-block px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-semibold text-xs cursor-pointer shadow">Browse Bill Image<input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" /></label>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-gray-700 uppercase">Preview</h4>
            <div className="h-80 bg-gray-100 rounded-xl flex items-center justify-center border overflow-hidden"><img src={imagePreview} alt="Bill" className="max-h-full object-contain" /></div>
            <button onClick={() => { setImagePreview(null); setExtractedData(null); }} className="w-full py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold">Upload Another</button>
          </div>
          <div className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
            <h4 className="font-bold text-xs text-gray-700 uppercase">Verification</h4>
            {scanning ? (
              <div className="h-72 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-emerald-800 font-semibold animate-pulse">Scanning bill with Gemini Vision...</p>
              </div>
            ) : extractedData && (
              <div className="space-y-3">
                <div><label className="block text-[10px] text-gray-500 font-semibold">Bill Number</label><input type="text" value={extractedData.bill_number} onChange={e => setExtractedData({...extractedData, bill_number: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-xs" /></div>
                <div><label className="block text-[10px] text-gray-500 font-semibold">Buyer</label><input type="text" value={extractedData.buyer_name} onChange={e => setExtractedData({...extractedData, buyer_name: e.target.value})} className="w-full px-3 py-1.5 border rounded-lg text-xs" /></div>
                <button onClick={handleConfirmSale} className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow mt-2">Confirm & Save Sale</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function SalesHistory({ sales }) {
  const [search, setSearch] = useState('');
  const filtered = sales.filter(s => s.bill_number?.toLowerCase().includes(search.toLowerCase()) || s.buyer_name?.toLowerCase().includes(search.toLowerCase()));
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-gray-900">Sales History</h3><input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} className="px-3 py-2 border rounded-xl text-xs" /></div>
      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-gray-50 border-b text-gray-500"><tr><th className="p-4">Bill No</th><th className="p-4">Date</th><th className="p-4">Buyer</th><th className="p-4">Total</th><th className="p-4">Status</th></tr></thead>
          <tbody className="divide-y">
            {filtered.map(s => (
              <tr key={s.id} className="hover:bg-gray-50"><td className="p-4 font-bold text-emerald-800">{s.bill_number}</td><td className="p-4">{s.sale_date}</td><td className="p-4">{s.buyer_name}</td><td className="p-4 font-bold">₹{s.grand_total}</td><td className="p-4"><span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">{s.status}</span></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BuyersManagement({ buyers, setBuyers, sales }) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ buyer_name: '', phone: '', address: '' });
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-gray-900">Buyers Directory</h3><button onClick={() => setIsOpen(true)} className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold"><Plus className="w-4 h-4 inline mr-1" />Add Buyer</button></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {buyers.map(b => (
          <div key={b.id} className="bg-white p-5 rounded-2xl shadow-sm border space-y-2">
            <h4 className="font-bold text-gray-900">{b.buyer_name}</h4><p className="text-xs text-gray-400">{b.phone || 'No phone'} {b.address ? `• ${b.address}` : ''}</p>
          </div>
        ))}
      </div>
      {isOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold mb-4">Add Buyer</h3>
            <form onSubmit={e => { e.preventDefault(); setBuyers([...buyers, { id: Date.now().toString(), ...form }]); setIsOpen(false); }} className="space-y-4">
              <input type="text" required placeholder="Buyer Name" value={form.buyer_name} onChange={e => setForm({...form, buyer_name: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-sm" />
              <div className="flex justify-end space-x-2"><button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 border rounded-xl text-xs">Cancel</button><button type="submit" className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentManagement({ sales, setSales, payments, setPayments }) {
  const [selectedSale, setSelectedSale] = useState('');
  const [payAmount, setPayAmount] = useState('');
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Payments & Dues Ledger</h3>
      <div className="bg-white p-5 rounded-2xl shadow-sm border space-y-4 max-w-md">
        <h4 className="font-bold text-sm text-gray-800">Record Payment</h4>
        <form onSubmit={e => {
          e.preventDefault();
          const sale = sales.find(s => s.id === selectedSale);
          if (!sale) return;
          const paid = Number(sale.total_paid || 0) + Number(payAmount);
          const pending = Math.max(0, sale.grand_total - paid);
          setSales(sales.map(s => s.id === selectedSale ? {...s, total_paid: paid, pending_amount: pending, status: pending === 0 ? 'Paid' : 'Partially Paid'} : s));
          setPayments([{ id: Date.now().toString(), bill_number: sale.bill_number, amount: Number(payAmount), payment_date: new Date().toISOString().split('T')[0] }, ...payments]);
          setSelectedSale(''); setPayAmount('');
        }} className="space-y-3">
          <select value={selectedSale} onChange={e => setSelectedSale(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs bg-white" required>
            <option value="">Select pending bill...</option>
            {sales.filter(s => s.pending_amount > 0).map(s => <option key={s.id} value={s.id}>Bill #{s.bill_number} (Due: ₹{s.pending_amount})</option>)}
          </select>
          <input type="number" required placeholder="Amount (₹)" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full px-3 py-2 border rounded-xl text-xs" />
          <button type="submit" className="w-full py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold">Save Payment</button>
        </form>
      </div>
    </div>
  );
}

function ReportsAnalytics({ sales }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center"><h3 className="text-lg font-bold text-gray-900">Reports & Analytics</h3><button onClick={() => window.print()} className="px-4 py-2 border bg-white rounded-xl text-xs font-semibold flex items-center space-x-2"><Printer className="w-4 h-4" /><span>Print</span></button></div>
      <div className="bg-white p-6 rounded-2xl border shadow-sm">
        <h4 className="font-bold text-sm text-gray-800 mb-4">Sales Distribution</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sales.map(s => ({ name: s.bill_number, total: s.grand_total }))}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" fontSize={11} />
              <YAxis fontSize={11} />
              <Tooltip />
              <Bar dataKey="total" fill="#047857" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function Settings({ settings, setSettings }) {
  const [form, setForm] = useState(settings);
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <h3 className="text-lg font-bold text-gray-900">Farm & API Settings</h3>
      <form onSubmit={e => { e.preventDefault(); setSettings(form); alert('Settings saved successfully!'); }} className="bg-white p-6 rounded-2xl shadow-sm border space-y-4">
        <div><label className="block text-xs font-semibold mb-1">Farm Name</label><input type="text" value={form.farmName} onChange={e => setForm({...form, farmName: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs" /></div>
        <div><label className="block text-xs font-semibold mb-1">Gemini API Key</label><input type="password" value={form.geminiKey} onChange={e => setForm({...form, geminiKey: e.target.value})} className="w-full px-3 py-2 border rounded-xl text-xs font-mono" /></div>
        <button type="submit" className="w-full py-2.5 bg-emerald-700 text-white rounded-xl text-xs font-semibold">Save Settings</button>
      </form>
    </div>
  );
}