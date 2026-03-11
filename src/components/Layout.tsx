import { Outlet, Link, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';
import { Menu, X, Search } from 'lucide-react';
import { cn } from '../lib/utils';

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [settings, setSettings] = useState<any>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const location = useLocation();

  useEffect(() => {
    fetch('/api/settings').then(res => res.json()).then(setSettings);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearchQuery(q);
    if (q.length > 2) {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setSearchResults(data);
    } else {
      setSearchResults([]);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header */}
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg lg:hidden"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <Link to="/" className="text-xl font-bold tracking-tight text-neutral-900">
            {settings.academy_title || 'Academy'}
          </Link>
          <div className="hidden sm:flex items-center gap-2 mr-6">
            <Link to="/" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors">الرئيسية</Link>
            <Link to="/courses" className="text-sm font-medium text-neutral-600 hover:text-neutral-900 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors">الدورات</Link>
          </div>
        </div>

        <div className="relative flex-1 max-w-md mx-4 hidden sm:block">
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-neutral-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="بحث عن درس..."
            className="w-full pr-10 pl-4 py-2 bg-neutral-100 border-transparent focus:bg-white focus:border-neutral-300 rounded-xl text-sm transition-all outline-none"
            value={searchQuery}
            onChange={handleSearch}
          />
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl overflow-hidden z-50">
              {searchResults.map((res: any) => (
                <Link
                  key={res.id + res.type}
                  to={res.type === 'lesson' ? `/lesson/${res.slug}` : '/'}
                  className="block px-4 py-3 hover:bg-neutral-50 border-b border-neutral-100 last:border-0"
                  onClick={() => setSearchResults([])}
                >
                  <div className="text-sm font-medium text-neutral-900">{res.title}</div>
                  <div className="text-xs text-neutral-500 uppercase">{res.type === 'lesson' ? 'درس' : 'سلسلة'}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link to="/admin" className="text-xs font-medium text-neutral-500 hover:text-neutral-900 px-3 py-1.5 rounded-lg border border-neutral-200">
            لوحة التحكم
          </Link>
        </div>
      </header>

      <div className="flex flex-1 relative">
        {/* Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 w-72 bg-white border-r border-neutral-200 z-50 transition-transform lg:sticky lg:top-16 lg:h-[calc(100vh-64px)] lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <Sidebar />
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
