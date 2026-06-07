import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  MessageSquare,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCheck,
  Trash2,
  Package,
  Star,
  Clock,
  X
} from 'lucide-react';

const NOTIF_ICONS = {
  message: MessageSquare,
  boost: Zap,
  trust: ShieldCheck,
  report: AlertTriangle,
  product: Package,
  premium: Star,
  default: Bell,
};

const NOTIF_COLORS = {
  message: 'var(--neon-blue)',
  boost: 'var(--neon-pink)',
  trust: '#10b981',
  report: '#fbbf24',
  product: 'var(--neon-purple)',
  premium: '#fbbf24',
  default: 'var(--text-secondary)',
};

const NotificationsPage = () => {
  const { token, setUnreadNotifications } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/notifications', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data.notifications || data.data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
      setUnreadNotifications(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const deleteNotif = async (id) => {
    try {
      await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all notifications?')) return;
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotifications([]);
      setUnreadNotifications(0);
    } catch (err) {
      console.error(err);
    }
  };

  const timeSince = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="container section animate-fade" style={{ paddingTop: '40px', maxWidth: '720px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={24} style={{ color: 'var(--neon-blue)' }} /> Notifications
            {unreadCount > 0 && (
              <span style={{
                background: 'var(--neon-blue)', color: '#050508', borderRadius: '99px',
                padding: '2px 10px', fontSize: '13px', fontWeight: 700,
              }}>
                {unreadCount}
              </span>
            )}
          </h1>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn btn-secondary" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <CheckCheck size={14} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="btn btn-danger" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <Trash2 size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
          <div className="loading-spinner" />
        </div>
      ) : notifications.length === 0 ? (
        <div
          className="glass-panel"
          style={{ padding: '60px', textAlign: 'center', borderStyle: 'dashed' }}
        >
          <Bell size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px', opacity: 0.4 }} />
          <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>No Notifications</h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            You're all caught up! Notifications about messages, boosts, and reports will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((notif) => {
            const Icon = NOTIF_ICONS[notif.type] || NOTIF_ICONS.default;
            const color = NOTIF_COLORS[notif.type] || NOTIF_COLORS.default;

            return (
              <div
                key={notif._id}
                onClick={() => !notif.read && markAsRead(notif._id)}
                className="glass-panel-interactive"
                style={{
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '14px',
                  borderRadius: '14px',
                  cursor: notif.read ? 'default' : 'pointer',
                  background: notif.read ? 'rgba(18, 18, 26, 0.3)' : 'rgba(0, 216, 255, 0.03)',
                  borderColor: notif.read ? 'var(--border-color)' : 'rgba(0, 216, 255, 0.1)',
                  opacity: notif.read ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                {/* Icon */}
                <div style={{
                  width: '38px', height: '38px', borderRadius: '10px',
                  background: `${color}15`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  color: color,
                }}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: notif.read ? 400 : 600, lineHeight: 1.4 }}>
                    {notif.message}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={11} /> {timeSince(notif.createdAt)}
                    </span>
                    {!notif.read && (
                      <span style={{
                        width: '6px', height: '6px', borderRadius: '50%',
                        background: 'var(--neon-blue)',
                      }} />
                    )}
                  </div>
                </div>

                {/* Delete */}
                <button
                  onClick={(e) => { e.stopPropagation(); deleteNotif(notif._id); }}
                  style={{
                    background: 'none', border: 'none', color: 'var(--text-muted)',
                    cursor: 'pointer', padding: '4px', borderRadius: '6px',
                    transition: 'all 0.2s', flexShrink: 0,
                  }}
                  className="notif-delete"
                >
                  <X size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .notif-delete:hover {
          color: var(--neon-pink) !important;
          background: rgba(247, 37, 133, 0.1) !important;
        }
      `}</style>
    </div>
  );
};

export default NotificationsPage;
