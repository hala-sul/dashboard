import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "../../layouts/DashboardLayout";
import api from "../../api/axios";
import {
  getVerificationDetails,
  reviewVerification,
} from "../../api/verificationApi";
import "./VerificationDetailsPage.css";

export default function VerificationDetailsPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [documents, setDocuments] = useState([]);
  const [imageUrls, setImageUrls] = useState({});
  const [actionLoading, setActionLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  
  // 🔥 قراءة البيانات من localStorage
  const [userInfo, setUserInfo] = useState(() => {
    const savedData = localStorage.getItem('verificationUserData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        console.log("📥 تم قراءة البيانات من localStorage:", parsed);
        return {
          firstname: parsed.firstname || 'غير متوفر',
          lastname: parsed.lastname || 'غير متوفر',
          email: parsed.email || 'غير متوفر'
        };
      } catch (e) {
        console.error("❌ خطأ في قراءة localStorage:", e);
      }
    }
    return {
      firstname: 'غير متوفر',
      lastname: 'غير متوفر',
      email: 'غير متوفر'
    };
  });

  useEffect(() => {
    fetchDetails();
  }, [userId]);

  const fetchDetails = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await getVerificationDetails(userId);
      console.log("📄 الرد من API:", res.data);

      if (res.data && res.data.success) {
        const data = res.data.data || [];
        console.log("📦 البيانات:", data);

        if (data.length === 0) {
          setError("لا توجد مستندات لهذا المستخدم");
          setLoading(false);
          return;
        }

        // 🔥 إذا كانت البيانات في localStorage غير موجودة، حاول جلبها من API
        const firstItem = data[0];
        if (firstItem.firstname || firstItem.lastname || firstItem.email) {
          setUserInfo({
            firstname: firstItem.firstname || userInfo.firstname,
            lastname: firstItem.lastname || userInfo.lastname,
            email: firstItem.email || userInfo.email
          });
        }

        const formattedData = data.map((item) => ({
          id: item.id,
          userId: item.userId,
          documentType: item.documentType || getDocumentType(item),
          status: item.status || 'PENDING',
          filePath: item.filePath,
          uploadedAt: item.uploadedAt,
        }));

        setDocuments(formattedData);

        const images = {};
        for (const doc of formattedData) {
          try {
            console.log(`📸 جاري تحميل الصورة للمستند ID: ${doc.id}`);
            
            const response = await api.get(
              `/admin/verification/document/${doc.id}`,
              {
                responseType: "blob",
                timeout: 15000,
              }
            );

            if (response.data && response.data.size > 0) {
              const imageUrl = URL.createObjectURL(response.data);
              images[doc.id] = imageUrl;
              console.log(`✅ تم تحميل الصورة للمستند ${doc.id}`);
            } else {
              images[doc.id] = null;
            }
          } catch (imgError) {
            console.error(`❌ فشل تحميل الصورة للمستند ${doc.id}:`, imgError);
            images[doc.id] = null;
          }
        }

        setImageUrls(images);
      } else {
        setError(res.data?.message || "فشل في جلب البيانات");
      }
    } catch (err) {
      console.error("❌ خطأ في جلب التفاصيل:", err);
      setError(err.response?.data?.message || err.message || "خطأ في السيرفر");
    } finally {
      setLoading(false);
    }
  };

  const getDocumentType = (item) => {
    if (item.documentType) return item.documentType;
    
    if (item.nationalIdFront !== undefined && item.nationalIdFront !== null) {
      return "NATIONAL_ID_FRONT";
    }
    if (item.nationalIdBack !== undefined && item.nationalIdBack !== null) {
      return "NATIONAL_ID_BACK";
    }
    if (item.selfie !== undefined && item.selfie !== null) {
      return "SELFIE";
    }
    return "UNKNOWN";
  };

  const handleReview = async (id, status) => {
    setActionLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await reviewVerification(id, status);
      console.log("📝 نتيجة المراجعة:", res.data);
      
      if (res.data.success) {
        setSuccess(`✅ تم ${status === "APPROVED" ? "قبول" : "رفض"} المستند بنجاح`);
        setTimeout(() => fetchDetails(), 1500);
      } else {
        setError(res.data?.message || "فشل التحديث");
      }
    } catch (err) {
      console.error("❌ خطأ أثناء المراجعة:", err);
      setError(err.response?.data?.message || "خطأ أثناء التحديث");
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    }).catch(err => {
      console.error('❌ فشل النسخ:', err);
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      if (type === 'id') {
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
      } else if (type === 'email') {
        setCopiedEmail(true);
        setTimeout(() => setCopiedEmail(false), 2000);
      }
    });
  };

  const getDocumentTypeLabel = (type) => {
    const types = {
      SELFIE: "📸 الصورة الشخصية",
      NATIONAL_ID_FRONT: "🪪 البطاقة الأمامية",
      NATIONAL_ID_BACK: "🪪 البطاقة الخلفية",
    };
    return types[type] || type || "📄 مستند";
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "APPROVED": return "✅ مقبول";
      case "REJECTED": return "❌ مرفوض";
      default: return "⏳ قيد الانتظار";
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="details-page">
          <div className="loading-container">
            <div className="spinner"></div>
            <p>جاري تحميل التفاصيل...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="details-page">
        <div className="details-header">
          <button className="back-btn" onClick={() => navigate("/verification")}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <div className="header-content">
            <h1>📋 تفاصيل طلب التحقق</h1>
            <p className="header-subtitle">مراجعة المستندات واتخاذ القرار</p>
          </div>
        </div>

        {error && <div className="alert alert-error">❌ {error}</div>}
        {success && <div className="alert alert-success">✅ {success}</div>}

        <div className="user-info-cards">
          <div className="info-card">
            <div className="card-icon">👤</div>
            <div className="card-content">
              <div className="card-label">الاسم الكامل</div>
              <div className="card-value user-name">
                {userInfo.firstname} {userInfo.lastname}
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">📧</div>
            <div className="card-content">
              <div className="card-label">البريد الإلكتروني</div>
              <div className="card-value-with-action">
                <span className="card-value email-text">{userInfo.email}</span>
                <button 
                  className={`copy-btn ${copiedEmail ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(userInfo.email, 'email')}
                  title="نسخ البريد الإلكتروني"
                >
                  <svg className="copy-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span className="copy-text">{copiedEmail ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">🆔</div>
            <div className="card-content">
              <div className="card-label">User ID</div>
              <div className="card-value-with-action">
                <span className="card-value id-text">{userId}</span>
                <button 
                  className={`copy-btn ${copiedId ? 'copied' : ''}`}
                  onClick={() => copyToClipboard(userId, 'id')}
                  title="نسخ الـ ID"
                >
                  <svg className="copy-icon" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                  <span className="copy-text">{copiedId ? 'تم النسخ!' : 'نسخ'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="info-card">
            <div className="card-icon">📄</div>
            <div className="card-content">
              <div className="card-label">عدد المستندات</div>
              <div className="card-value doc-count">{documents.length} مستند</div>
            </div>
          </div>
        </div>

        <div className="documents-section">
          <div className="section-header">
            <h2>📎 المستندات المرفوعة</h2>
            <span className="documents-count">{documents.length} مستند</span>
          </div>

          <div className="documents-grid">
            {documents.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p>لا توجد مستندات مرفوعة</p>
              </div>
            ) : (
              documents.map((doc) => {
                const imageUrl = imageUrls[doc.id];
                const hasImage = imageUrl && imageUrl !== null;

                return (
                  <div className="doc-card" key={doc.id}>
                    <div className="doc-header">
                      <h3 className="doc-title">{getDocumentTypeLabel(doc.documentType)}</h3>
                      <span className={`doc-status-badge ${doc.status?.toLowerCase()}`}>
                        {getStatusLabel(doc.status)}
                      </span>
                    </div>

                    <div className="doc-image-container">
                      {hasImage ? (
                        <img
                          src={imageUrl}
                          alt={doc.documentType}
                          className="doc-image"
                          onError={(e) => {
                            console.error(`❌ خطأ في تحميل الصورة للمستند ${doc.id}`);
                            e.target.style.display = 'none';
                            const parent = e.target.parentElement;
                            parent.innerHTML = `
                              <div class="doc-placeholder">
                                <span class="placeholder-icon">🖼️</span>
                                <p>خطأ في تحميل الصورة</p>
                              </div>
                            `;
                          }}
                        />
                      ) : (
                        <div className="doc-placeholder">
                          <span className="placeholder-icon">📷</span>
                          <p>لا توجد صورة</p>
                        </div>
                      )}
                    </div>

                    {doc.status === "PENDING" && (
                      <div className="doc-actions">
                        <button
                          className="approve-btn"
                          disabled={actionLoading}
                          onClick={() => handleReview(doc.id, "APPROVED")}
                        >
                          {actionLoading ? (
                            <span className="btn-spinner"></span>
                          ) : (
                            "✅ قبول"
                          )}
                        </button>

                        <button
                          className="reject-btn"
                          disabled={actionLoading}
                          onClick={() => handleReview(doc.id, "REJECTED")}
                        >
                          {actionLoading ? (
                            <span className="btn-spinner"></span>
                          ) : (
                            "❌ رفض"
                          )}
                        </button>
                      </div>
                    )}

                    {doc.status !== "PENDING" && (
                      <div className="doc-reviewed">
                        <span>✅ تم المراجعة</span>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}