import { Outlet } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';

export function Root() {
  return (
    <div className="flex bg-[#1e1f2e] min-h-screen">
      <Sidebar />
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
}
