import React, { useState, useEffect, useRef } from 'react';
import { dbService } from '../../services/store';
import { CustomerNotification } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from '../../router/Router';
import { Bell, CheckCheck, Package, Clock, X } from 'lucide-react';

export const NotificationDropdown: React.FC = () => {
  const { currentUser } = useAuth();
  const { navigate } = useRouter();
  const customerId = currentUser?.id || 'demo_customer';

  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifs = () => {
    setNotifications(dbService.getNotifications(customerId));
    setUnreadCount(dbService.getUnreadNotificationCount(customerId));
  };

  useEffect(() => {
    fetchNotifs();
    const unsubscribe = dbService.subscribe(fetchNotifs);
    return () => unsubscribe();
  }, [customerId]);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleNotificationClick = (notif: CustomerNotification) => {
    dbService.markNotificationAsRead(notif.id);
    fetchNotifs();
    setIsOpen(false);
    if (notif.orderId) {
      navigate(`/orders/${notif.orderId}`);
    }
  };

  const handleMarkAllRead = () => {
    dbService.markAllNotificationsAsRead(customerId);
    fetchNotifs();
  };

  return (
    <div className="sm:relative" ref={dropdownRef} dir="rtl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-gray-600 hover:text-[#FF6600] hover:bg-white/70 backdrop-blur-xs transition cursor-pointer"
        aria-label="الإشعارات"
        aria-expanded={isOpen}
      >
        <Bell className="w-5 h-5 stroke-[2.2]" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6600] text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 end-3 sm:end-0 start-auto w-[calc(100vw-24px)] max-w-sm sm:w-96 bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/90 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-4 pb-2.5 border-b border-gray-100/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-black text-sm text-[#1A1A1B] truncate">الإشعارات والتنبيهات</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 bg-orange-500/12 text-[#FF6600] text-[10px] font-black rounded-full border border-orange-500/20 shrink-0">
                  {unreadCount} جديد
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="text-[11px] text-[#FF6600] hover:underline font-bold flex items-center gap-1 cursor-pointer shrink-0"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>تحديد الكل كمقروء</span>
              </button>
            )}
          </div>

          <div className="max-h-[min(22rem,65vh)] overflow-y-auto divide-y divide-gray-50 overscroll-contain">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                لا توجد إشعارات حتى الآن
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3.5 hover:bg-gray-50 transition cursor-pointer flex items-start gap-3 ${
                    !notif.isRead ? 'bg-orange-50/40' : ''
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      !notif.isRead
                        ? 'bg-[#F27D26] text-white'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-xs text-[#1A1A1B] truncate">
                        {notif.title}
                      </span>
                      {!notif.isRead && (
                        <span className="w-2 h-2 rounded-full bg-[#F27D26] shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 mt-1">
                      <Clock className="w-3 h-3 shrink-0" />
                      <span className="truncate">{new Date(notif.createdAt).toLocaleTimeString('ar-DZ')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
