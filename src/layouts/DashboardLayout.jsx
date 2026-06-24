import Sidebar from "../components/layout/Sidebar";
import Header from "../components/layout/Header";
import "./DashboardLayout.css";

export default function DashboardLayout({ children, title = "إدارة المستخدمين" }) {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header title={title} />
        <main className="page-content">
          {children}
        </main>
      </div>
    </div>
  );
}