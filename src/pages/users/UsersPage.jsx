import DashboardLayout from "../../layouts/DashboardLayout";
import "./UsersPage.css";

export default function UsersPage() {
  return (
    <DashboardLayout>
      <div className="stats-cards">

        <div className="stat-card">
          <h3>1250</h3>
          <p>إجمالي المستخدمين</p>
        </div>

        <div className="stat-card">
          <h3>650</h3>
          <p>المشترون</p>
        </div>

        <div className="stat-card">
          <h3>420</h3>
          <p>البائعون</p>
        </div>

        <div className="stat-card">
          <h3>180</h3>
          <p>الوسطاء</p>
        </div>

      </div>
    </DashboardLayout>
  );
}