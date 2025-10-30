import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { GNB } from "./GNB";

export function MainLayout() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <GNB />
      <main className="ml-64 mt-16 p-6">
        <Outlet />
      </main>
    </div>
  );
}
