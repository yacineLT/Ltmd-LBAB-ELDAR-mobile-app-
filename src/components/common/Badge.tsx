import React from 'react';
import { OrderStatus, UserRole } from '../../types';

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  switch (role) {
    case 'ADMIN':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/12 text-purple-700 border border-purple-300/40 backdrop-blur-xs">
          مسؤول النظام (Admin)
        </span>
      );
    case 'MERCHANT':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/12 text-blue-700 border border-blue-300/40 backdrop-blur-xs">
          تاجر معتمد (Merchant)
        </span>
      );
    case 'COURIER':
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/12 text-amber-800 border border-amber-300/40 backdrop-blur-xs">
          كابتن توصيل (Courier)
        </span>
      );
    case 'CUSTOMER':
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/12 text-emerald-800 border border-emerald-300/40 backdrop-blur-xs">
          زبون (Customer)
        </span>
      );
  }
};

export const OrderStatusBadge: React.FC<{ status: OrderStatus }> = ({ status }) => {
  const config: Record<OrderStatus, { label: string; bg: string; text: string; border: string }> = {
    PENDING: { label: 'قيد الانتظار', bg: 'bg-amber-500/10', border: 'border-amber-400/40', text: 'text-amber-800' },
    ACCEPTED: { label: 'تم القبول', bg: 'bg-blue-500/10', border: 'border-blue-400/40', text: 'text-blue-800' },
    PREPARING: { label: 'قيد التحضير', bg: 'bg-indigo-500/10', border: 'border-indigo-400/40', text: 'text-indigo-800' },
    READY_FOR_PICKUP: { label: 'جاهز للاستلام', bg: 'bg-cyan-500/10', border: 'border-cyan-400/40', text: 'text-cyan-800' },
    COURIER_ASSIGNED: { label: 'تم تعيين الموصّل', bg: 'bg-orange-500/10', border: 'border-orange-400/40', text: 'text-orange-800' },
    PICKED_UP: { label: 'تم الاستلام', bg: 'bg-teal-500/10', border: 'border-teal-400/40', text: 'text-teal-800' },
    ON_THE_WAY: { label: 'في الطريق إليك', bg: 'bg-yellow-500/12', border: 'border-yellow-400/40', text: 'text-yellow-800' },
    ARRIVED: { label: 'الموصّل عند الباب', bg: 'bg-emerald-500/12', border: 'border-emerald-400/40', text: 'text-emerald-800' },
    DELIVERED: { label: 'تم التسليم بنجاح', bg: 'bg-green-500/12', border: 'border-green-400/40', text: 'text-green-800' },
    CANCELLED: { label: 'ملغي', bg: 'bg-rose-500/12', border: 'border-rose-400/40', text: 'text-rose-800' },
  };

  const item = config[status] || { label: status, bg: 'bg-gray-500/10', border: 'border-gray-400/30', text: 'text-gray-800' };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-xs ${item.bg} ${item.border} ${item.text}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {item.label}
    </span>
  );
};
