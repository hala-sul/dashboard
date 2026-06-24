import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getPendingVerifications } from "../../api/verificationApi";
import "./VerificationPage.css";

export default function VerificationPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await getPendingVerifications(0, 100);
      console.log("📦 البيانات:", response.data);

      if (response.data.success) {
        const data = response.data.data || [];
        
        const formattedData = data.map((item) => ({
          id: item.id || Math.random().toString(36).substr(2, 9),
          userId: item.userId || item.id || 'N/A',
          firstname: item.firstname || '',
          lastname: item.lastname || '',
          email: item.email || '',
          front: item.nationalIdFront || "PENDING",
          back: item.nationalIdBack || "PENDING",
          selfie: item.selfie || "PENDING",
          status: getOverallStatus(item),
          readyToReview: item.readyToReview || false,
          verified: item.verified || false,
          timestamp: item.timestamp || null
        }));
        
        setRequests(formattedData);
        setTotalItems(formattedData.length);
      } else {
        setError("فشل في جلب البيانات");
      }
    } catch (err) {
      console.error("❌ خطأ:", err);
      if (err.response?.status === 401) {
        navigate("/");
      } else {
        setError(err.response?.data?.message || "حدث خطأ أثناء جلب البيانات");
      }
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatus = (item) => {
    const statuses = [item.nationalIdFront, item.nationalIdBack, item.selfie];
    if (statuses.includes("REJECTED")) return "Rejected";
    if (statuses.every((s) => s === "APPROVED")) return "Approved";
    if (statuses.some((s) => s === "PENDING")) return "Pending";
    return "Pending";
  };

  // 🔥 دالة حفظ البيانات في localStorage والانتقال
  const handleViewDetails = (item) => {
    // حفظ بيانات المستخدم في localStorage
    const userData = {
      firstname: item.firstname || 'غير متوفر',
      lastname: item.lastname || 'غير متوفر',
      email: item.email || 'غير متوفر',
      userId: item.id || item.userId
    };
    
    localStorage.setItem('verificationUserData', JSON.stringify(userData));
    console.log("💾 تم حفظ البيانات في localStorage:", userData);
    
    // الانتقال إلى صفحة التفاصيل
    navigate(`/verification/${item.id || item.userId}`);
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    document.querySelector('.verification-content')?.scrollIntoView({ behavior: 'smooth' });
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      APPROVED: { class: "badge-approved", label: "✅ مقبول" },
      REJECTED: { class: "badge-rejected", label: "❌ مرفوض" },
      PENDING: { class: "badge-pending", label: "⏳ قيد الانتظار" },
    };
    return statusMap[status] || { class: "badge-pending", label: status || "—" };
  };

  const renderPaginationButtons = () => {
    const buttons = [];
    const maxVisibleButtons = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisibleButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);
    
    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    buttons.push(
      <button
        key="prev"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="page-btn prev-next"
      >
        ‹
      </button>
    );

    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => handlePageChange(1)} className="page-btn">
          1
        </button>
      );
      if (startPage > 2) {
        buttons.push(
          <span key="dots1" className="page-dots">...</span>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`page-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="dots2" className="page-dots">...</span>
        );
      }
      buttons.push(
        <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="page-btn">
          {totalPages}
        </button>
      );
    }

    buttons.push(
      <button
        key="next"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="page-btn prev-next"
      >
        ›
      </button>
    );

    return buttons;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="verification-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>جاري تحميل البيانات...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="verification-page">
          <div className="error-container">
            <p>❌ {error}</p>
            <button onClick={fetchVerifications} className="retry-btn">
              إعادة المحاولة
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="verification-page">
        <div className="verification-header">
          <div className="header-left">
            <h1 className="page-title">📋 إدارة التحقق</h1>
            <p className="page-subtitle">مراجعة طلبات التحقق الخاصة بالمستخدمين</p>
          </div>
          <div className="header-right">
            <div className="stats-badge">
              <span className="stats-number">{requests.length}</span>
              <span className="stats-label">طلبات</span>
            </div>
          </div>
        </div>

        <div className="verification-content">
          {/* Desktop Table View */}
          <div className="table-wrapper desktop-only">
            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">لا توجد طلبات تحقق</p>
              </div>
            ) : (
              <table className="verification-table">
                <thead>
                  <tr>
                    <th>👤 الاسم الأول</th>
                    <th>👤 اسم العائلة</th>
                    <th>📧 الإيميل</th>
                    <th>📄 البطاقة الأمامية</th>
                    <th>📄 البطاقة الخلفية</th>
                    <th>📄 الصورة الشخصية</th>
                    <th>📊 الحالة الكلية</th>
                    <th>⚡ الإجراء</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => {
                    const frontBadge = getStatusBadge(item.front);
                    const backBadge = getStatusBadge(item.back);
                    const selfieBadge = getStatusBadge(item.selfie);

                    return (
                      <tr key={item.id} className="table-row">
                        <td className="firstname-cell">
                          {item.firstname || <span className="empty-field">—</span>}
                        </td>
                        <td className="lastname-cell">
                          {item.lastname || <span className="empty-field">—</span>}
                        </td>
                        <td className="email-cell">
                          {item.email || <span className="empty-field">—</span>}
                        </td>
                        <td>
                          <span className={`badge ${frontBadge.class}`}>
                            {frontBadge.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${backBadge.class}`}>
                            {backBadge.label}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${selfieBadge.class}`}>
                            {selfieBadge.label}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge status-${item.status.toLowerCase()}`}>
                            {item.status === "Pending" && "⏳ قيد الانتظار"}
                            {item.status === "Approved" && "✅ مقبول"}
                            {item.status === "Rejected" && "❌ مرفوض"}
                          </span>
                        </td>
                        <td>
                          <button 
                            className="action-btn"
                            onClick={() => handleViewDetails(item)}
                          >
                            👁 عرض
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          {/* Mobile Cards View */}
          <div className="mobile-cards">
            {requests.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p className="empty-text">لا توجد طلبات تحقق</p>
              </div>
            ) : (
              currentItems.map((item) => {
                const frontBadge = getStatusBadge(item.front);
                const backBadge = getStatusBadge(item.back);
                const selfieBadge = getStatusBadge(item.selfie);

                return (
                  <div key={item.id} className="verification-card">
                    <div className="card-header">
                      <div className="user-info">
                        <span className="user-name">
                          {item.firstname} {item.lastname}
                        </span>
                      </div>
                      <span className={`status-badge status-${item.status.toLowerCase()}`}>
                        {item.status === "Pending" && "⏳ قيد الانتظار"}
                        {item.status === "Approved" && "✅ مقبول"}
                        {item.status === "Rejected" && "❌ مرفوض"}
                      </span>
                    </div>

                    <div className="card-body">
                      <div className="info-row">
                        <span className="info-label">👤 الاسم الأول:</span>
                        <span className="info-value">
                          {item.firstname || <span className="empty-field">—</span>}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">👤 اسم العائلة:</span>
                        <span className="info-value">
                          {item.lastname || <span className="empty-field">—</span>}
                        </span>
                      </div>
                      <div className="info-row">
                        <span className="info-label">📧 الإيميل:</span>
                        <span className="info-value">
                          {item.email || <span className="empty-field">—</span>}
                        </span>
                      </div>
                    </div>

                    <div className="card-documents">
                      <div className="document-item">
                        <span className="doc-label">البطاقة الأمامية</span>
                        <span className={`badge ${frontBadge.class}`}>
                          {frontBadge.label}
                        </span>
                      </div>
                      <div className="document-item">
                        <span className="doc-label">البطاقة الخلفية</span>
                        <span className={`badge ${backBadge.class}`}>
                          {backBadge.label}
                        </span>
                      </div>
                      <div className="document-item">
                        <span className="doc-label">الصورة الشخصية</span>
                        <span className={`badge ${selfieBadge.class}`}>
                          {selfieBadge.label}
                        </span>
                      </div>
                    </div>

                    <div className="card-actions">
                      <button 
                        className="action-btn"
                        onClick={() => handleViewDetails(item)}
                      >
                        👁 عرض
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {requests.length > itemsPerPage && (
            <div className="pagination-wrapper">
              <div className="pagination-info">
                <span>
                  عرض {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, requests.length)} 
                  {' '}من {requests.length} طلب
                </span>
              </div>
              <div className="pagination">
                {renderPaginationButtons()}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
