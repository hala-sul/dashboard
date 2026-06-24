import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../../api/authApi";
import "./LoginPage.css";

export default function LoginPage() {
  const navigate = useNavigate();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    console.log("📧 البريد:", email);
    console.log("🔒 كلمة المرور:", password);

    try {
      const response = await login(email, password);
      console.log("📦 الرد الكامل:", response);
      console.log("📦 الرد data:", response.data);

      // ✅ التحقق من وجود التوكن
      if (response.data.data?.access_token) {
        // حفظ التوكنات
        localStorage.setItem("access_token", response.data.data.access_token);
        localStorage.setItem("refresh_token", response.data.data.refresh_token);
        localStorage.setItem("user_email", email);
        
        setSuccess("✅ تم تسجيل الدخول بنجاح!");
        console.log("🎉 التوكن:", response.data.data.access_token);
        console.log("🔄 جاري التحويل...");
        
        // ✅ التحويل للصفحة الرئيسية
        navigate("/verification");
        
      } else if (response.data.data?.verified === false) {
        setError("⚠️ حسابك غير مفعّل. يرجى تفعيله عبر البريد الإلكتروني.");
      } else {
        setError("⚠️ حدث خطأ غير متوقع");
        console.log("❌ لم يتم العثور على access_token");
      }
    } catch (err) {
      console.error("🚨 خطأ:", err);
      console.error("🚨 تفاصيل الخطأ:", err.response);
      
      const errorMessage = err.response?.data?.message;
      const status = err.response?.status;
      
      if (status === 500 && errorMessage === "User is disabled") {
        setError("⚠️ حسابك غير مفعّل. يرجى التحقق من بريدك الإلكتروني وتفعيل الحساب.");
      } else if (status === 500 && errorMessage === "Bad credentials") {
        setError("⚠️ البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      } else if (status === 401) {
        setError("⚠️ غير مصرح. يرجى التحقق من بيانات الدخول.");
      } else {
        setError(errorMessage || "فشل تسجيل الدخول. تأكد من البريد الإلكتروني وكلمة المرور.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="login-card">
        <div className="login-header">
          <div className="logo">D</div>
          <h1>مرحباً بعودتك</h1>
          <p>سجل الدخول إلى حسابك للوصول إلى لوحة التحكم</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message">⚠️ {error}</div>}
          {success && <div className="success-message">✓ {success}</div>}

          <div className="input-group">
            <label>البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="example@domain.com"
            />
          </div>

          <div className="input-group">
            <label>كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          <div className="forgot-link">
            <a href="#" onClick={(e) => { 
              e.preventDefault(); 
              alert("سيتم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني"); 
            }}>
              نسيت كلمة المرور؟
            </a>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span>
                جاري تسجيل الدخول...
              </>
            ) : (
              "تسجيل الدخول"
            )}
          </button>
        </form>

        <div className="signup-link">
          ليس لديك حساب؟ <a href="#">إنشاء حساب جديد</a>
        </div>
      </div>
    </div>
  );
}