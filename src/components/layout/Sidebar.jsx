import {
  LayoutDashboard,
  Users,
  Store,
  Package,
  Truck,
  WalletCards,
  Settings,
  Bell,
  Moon,
  LogOut,
} from "lucide-react";
import "./Sidebar.css";

export default function Sidebar() {
  const userEmail = localStorage.getItem("user_email");

  return (
    <aside className="sidebar">
      {/* أعلى القائمة */}
      <div className="sidebar-top">
        <div className="profile">
          <div className="profile-icon">
            <Settings size={18} />
          </div>

          <div className="profile-info">
            <h4>وسيطي</h4>
            <span>لوحة المشرف</span>
          </div>
        </div>

        <div className="divider"></div>

        <ul className="menu">
          <li>
            <LayoutDashboard size={20} />
            <span>لوحة التحكم</span>
          </li>

          <li className="active">
            <Users size={20} />
            <span>المستخدمون</span>
          </li>

          <li>
            <Store size={20} />
            <span>المتاجر والأقسام</span>
          </li>

          <li>
            <Package size={20} />
            <span>المنتجات</span>
          </li>

          <li>
            <Truck size={20} />
            <span>Dropshipping</span>
          </li>

          <li>
            <WalletCards size={20} />
            <span>الإدارة المالية</span>
          </li>

          <li>
            <Settings size={20} />
            <span>الإعدادات</span>
          </li>
        </ul>
      </div>

      {/* أسفل القائمة */}
      <div className="sidebar-bottom">
        <div className="bottom-icons">
          <LogOut size={20} />
          <Moon size={20} />
          <Bell size={20} />
        </div>

        <div className="user-card">
          <div className="user-avatar">
            {userEmail?.charAt(0).toUpperCase()}
          </div>

          <div className="user-info">
            <h4>المشرف العام</h4>
            <p>{userEmail}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}