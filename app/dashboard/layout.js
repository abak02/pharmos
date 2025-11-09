// app/dashboard/layout.js
import SideNav from '@/app/ui/dashboard/sidenav';

export default function Layout({ children }) {
  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden">
      <div className="w-full flex-none md:w-64">
        <SideNav />
      </div>

      <div className="flex-grow p-6 overflow-y-auto md:p-12">
        {children}
      </div>
    </div>
  );
}
