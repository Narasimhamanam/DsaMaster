import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { motion, AnimatePresence } from 'framer-motion';

const AppLayout = () => {
  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 ml-0 md:ml-64">
        <Topbar />
        <main className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
