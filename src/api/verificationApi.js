import api from "./axios";

// جلب طلبات التحقق
export const getPendingVerifications = (page = 0, size = 10) => {
  return api.get(`/admin/verification/pending?page=${page}&size=${size}`);
};

// جلب تفاصيل المستندات حسب userId
export const getVerificationDetails = (userId) => {
  return api.get(`/admin/verification/document?userId=${userId}`);
};

// قبول / رفض
export const reviewVerification = (id, status) => {
  return api.patch(`/admin/verification/review/${id}?status=${status}`);
};