    import React from 'react';
    import { Menu, Bell, Search, User, LogOut, Settings } from 'lucide-react';
    import { useAuth } from '../../context/AuthContext';
    import { useApp } from '../../context/AppContext';

    const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const { setSidebarOpen } = useApp();
    const [showUserMenu, setShowUserMenu] = React.useState(false);

    return (
        <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
            <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Menu className="w-5 h-5 text-gray-600" />
            </button>

            <div className="hidden md:flex items-center gap-3 bg-gray-100 rounded-lg px-4 py-2 w-96">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                type="text"
                placeholder="Search employees, departments..."
                className="bg-transparent flex-1 outline-none text-sm text-gray-700 placeholder-gray-500"
                />
            </div>
            </div>

            <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative">
                <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                <img
                    src={user?.avatar || 'https://as1.ftcdn.net/v2/jpg/03/39/45/96/1000_F_339459697_XAFacNQmwnvJRqe1Fe9VOptPWMUxlZP8.jpg'}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full object-cover"
                />
                <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                </div>
                </button>

                {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <User className="w-4 h-4" />
                    Profile
                    </a>
                    <a href="#" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <Settings className="w-4 h-4" />
                    Settings
                    </a>
                    <hr className="my-2 border-gray-200" />
                    <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                    </button>
                </div>
                )}
            </div>
            </div>
        </div>
        </header>
    );
    };

    export default Header;

