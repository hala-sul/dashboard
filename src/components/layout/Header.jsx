import { Bell, Search, User } from "lucide-react";
import "./Header.css";

export default function Header({ title = "إدارة المستخدمين" }) {
  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">{title}</h1>
      </div>

      <div className="header-right">
        {/* <div className="header-search">
          <Search size={18} className="search-icon" />
          <input type="text" placeholder="بحث..." />
        </div> */}

        <button className="header-btn">
          <Bell size={20} />
        </button>

        <div className="header-user">
          <div className="header-avatar">
            <User size={18} />
          </div>
        </div>
      </div>
    </header>
  );
}