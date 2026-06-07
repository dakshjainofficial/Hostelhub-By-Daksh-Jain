import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Send,
  ArrowLeft,
  MessageSquare,
  Search,
  MoreVertical,
  Trash2,
  ShieldCheck,
  ImageIcon,
  Clock,
  Circle,
  X
} from 'lucide-react';

const ChatPage = () => {
  const { conversationId } = useParams();
  const { token, user, socket, onlineUsers, setUnreadMessages } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [activeConv, setActiveConv] = useState(null);
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSidebar, setShowMobileSidebar] = useState(!conversationId);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Fetch conversations
  useEffect(() => {
    fetchConversations();
  }, [token]);

  // If conversationId in URL, load that conversation
  useEffect(() => {
    if (conversationId && conversations.length > 0) {
      const conv = conversations.find(c => c._id === conversationId);
      if (conv) {
        selectConversation(conv);
      } else {
        fetchMessages(conversationId);
      }
    }
  }, [conversationId, conversations]);

  // Socket listener for new messages
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      if (activeConv && msg.conversationId === activeConv._id) {
        setMessages(prev => [...prev, msg]);
        scrollToBottom();
        // Mark as read since we're viewing this conversation
        markConversationRead(activeConv._id);
      }
      // Refresh conversation list for updated last message
      fetchConversations();
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, activeConv]);

  const fetchConversations = async () => {
    try {
      setLoadingConvs(true);
      const res = await fetch('/api/conversations', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setConversations(data.data.conversations);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConvs(false);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      setLoadingMsgs(true);
      const res = await fetch(`/api/messages/${convId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setMessages(data.data.results || []);
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMsgs(false);
    }
  };

  const markConversationRead = async (convId) => {
    // Already handled by fetching messages (backend marks as read)
    setUnreadMessages(prev => Math.max(0, prev - 1));
  };

  const selectConversation = (conv) => {
    setActiveConv(conv);
    setShowMobileSidebar(false);
    fetchMessages(conv._id);
    if (conv._id !== conversationId) {
      navigate(`/chat/${conv._id}`, { replace: true });
    }

    // Join socket room
    if (socket) {
      socket.emit('joinConversation', conv._id);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeConv || sending) return;

    const otherUser = activeConv.otherParticipant;
    if (!otherUser) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: activeConv._id,
          receiverId: otherUser._id,
          text: messageText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages(prev => [...prev, data.data.message]);
        setMessageText('');
        scrollToBottom();
        fetchConversations();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isUserOnline = (userId) => {
    return onlineUsers?.includes(userId);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (date) => {
    const d = new Date(date);
    const today = new Date();
    if (d.toDateString() === today.toDateString()) return 'Today';
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return d.toLocaleDateString();
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    const name = conv.otherParticipant?.name?.toLowerCase() || '';
    const product = conv.productId?.title?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();
    return name.includes(q) || product.includes(q);
  });

  return (
    <div className="animate-fade" style={{ height: 'calc(100vh - 76px)', display: 'flex', overflow: 'hidden' }}>
      {/* Sidebar: Conversation list */}
      <aside
        className="chat-sidebar"
        style={{
          width: '340px',
          borderRight: '1px solid var(--border-color)',
          background: 'rgba(10, 10, 15, 0.5)',
          display: showMobileSidebar ? 'flex' : undefined,
          flexDirection: 'column',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-color)' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <MessageSquare size={20} style={{ color: 'var(--neon-blue)' }} /> Messages
          </h2>
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '38px', fontSize: '13px', height: '38px', borderRadius: '99px' }}
            />
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '8px' }}>
          {loadingConvs ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <div className="loading-spinner" />
            </div>
          ) : filteredConversations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <MessageSquare size={32} style={{ marginBottom: '12px', opacity: 0.4 }} />
              <p style={{ fontSize: '14px' }}>No conversations yet</p>
              <p style={{ fontSize: '12px', marginTop: '4px' }}>Start chatting by messaging a seller!</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const other = conv.otherParticipant;
              const isActive = activeConv?._id === conv._id;
              const online = isUserOnline(other?._id);

              return (
                <div
                  key={conv._id}
                  onClick={() => selectConversation(conv)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: isActive ? 'rgba(0, 216, 255, 0.08)' : 'transparent',
                    border: isActive ? '1px solid rgba(0, 216, 255, 0.15)' : '1px solid transparent',
                    transition: 'all 0.2s',
                    marginBottom: '4px',
                  }}
                  className="conv-item"
                >
                  {/* Avatar */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div style={{
                      width: '42px', height: '42px', borderRadius: '50%',
                      background: 'var(--gradient-primary)', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    }}>
                      {other?.profileImage?.url ? (
                        <img src={other.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#050508' }}>
                          {other?.name?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    {online && (
                      <div style={{
                        position: 'absolute', bottom: '0', right: '0',
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: '#10b981', border: '2px solid var(--bg-dark)',
                      }} />
                    )}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {other?.name || 'User'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                        {conv.lastMessageAt && formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                      <p style={{
                        fontSize: '12px', color: 'var(--text-muted)',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                        maxWidth: '180px',
                      }}>
                        {conv.lastMessage || (conv.productId?.title ? `📦 ${conv.productId.title}` : 'Start chatting...')}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          background: 'var(--neon-blue)', color: '#050508',
                          borderRadius: '50%', width: '18px', height: '18px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '10px', fontWeight: 'bold', flexShrink: 0,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="chat-main">
        {activeConv ? (
          <>
            {/* Chat Header */}
            <div style={{
              padding: '14px 20px', borderBottom: '1px solid var(--border-color)',
              display: 'flex', alignItems: 'center', gap: '12px',
              background: 'rgba(10, 10, 15, 0.5)', backdropFilter: 'blur(8px)',
            }}>
              <button
                onClick={() => { setActiveConv(null); setShowMobileSidebar(true); navigate('/chat'); }}
                className="mobile-back-btn"
                style={{
                  display: 'none', background: 'none', border: 'none',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                }}
              >
                <ArrowLeft size={20} />
              </button>

              <div style={{
                width: '36px', height: '36px', borderRadius: '50%',
                background: 'var(--gradient-primary)', display: 'flex',
                alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
              }}>
                {activeConv.otherParticipant?.profileImage?.url ? (
                  <img src={activeConv.otherParticipant.profileImage.url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#050508' }}>
                    {activeConv.otherParticipant?.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '15px' }}>{activeConv.otherParticipant?.name}</span>
                  {activeConv.otherParticipant?.verifiedSeller && <ShieldCheck size={14} style={{ color: 'var(--neon-blue)' }} />}
                </div>
                <p style={{ fontSize: '11px', color: isUserOnline(activeConv.otherParticipant?._id) ? '#10b981' : 'var(--text-muted)' }}>
                  {isUserOnline(activeConv.otherParticipant?._id) ? '● Online' : 'Offline'}
                </p>
              </div>

              {/* Product context badge */}
              {activeConv.productId && (
                <Link
                  to={`/product/${activeConv.productId._id}`}
                  className="glass-panel"
                  style={{
                    padding: '6px 12px', borderRadius: '99px', fontSize: '11px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: 'var(--neon-blue)', fontWeight: 500,
                  }}
                >
                  📦 {activeConv.productId.title?.substring(0, 20)}{activeConv.productId.title?.length > 20 ? '...' : ''}
                  {activeConv.productId.price && ` · ₹${activeConv.productId.price}`}
                </Link>
              )}
            </div>

            {/* Messages Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {loadingMsgs ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                  <div className="loading-spinner" />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  <MessageSquare size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px' }}>No messages yet</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Say hello to start the conversation!</p>
                </div>
              ) : (
                <>
                  {messages.map((msg, idx) => {
                    const isMe = msg.senderId?._id === user?._id || msg.senderId === user?._id;
                    const showDateSep = idx === 0 || formatDate(messages[idx - 1].createdAt) !== formatDate(msg.createdAt);

                    return (
                      <React.Fragment key={msg._id || idx}>
                        {showDateSep && (
                          <div style={{ textAlign: 'center', margin: '16px 0', fontSize: '11px', color: 'var(--text-muted)' }}>
                            <span style={{
                              background: 'rgba(255, 255, 255, 0.05)', padding: '4px 12px',
                              borderRadius: '99px', border: '1px solid var(--border-color)',
                            }}>
                              {formatDate(msg.createdAt)}
                            </span>
                          </div>
                        )}
                        <div style={{
                          display: 'flex',
                          justifyContent: isMe ? 'flex-end' : 'flex-start',
                          marginBottom: '2px',
                        }}>
                          <div style={{
                            maxWidth: '65%',
                            padding: '10px 14px',
                            borderRadius: isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                            background: isMe
                              ? 'linear-gradient(135deg, rgba(0, 216, 255, 0.2), rgba(157, 78, 221, 0.15))'
                              : 'rgba(255, 255, 255, 0.06)',
                            border: `1px solid ${isMe ? 'rgba(0, 216, 255, 0.15)' : 'rgba(255, 255, 255, 0.06)'}`,
                          }}>
                            <p style={{ fontSize: '14px', lineHeight: 1.5, wordBreak: 'break-word' }}>
                              {msg.text}
                            </p>
                            <div style={{
                              display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '4px',
                              marginTop: '4px', fontSize: '10px', color: 'var(--text-muted)',
                            }}>
                              {formatTime(msg.createdAt)}
                              {isMe && msg.read && (
                                <span style={{ color: 'var(--neon-blue)', fontSize: '10px' }}>✓✓</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Message Input */}
            <form
              onSubmit={sendMessage}
              style={{
                padding: '16px 20px', borderTop: '1px solid var(--border-color)',
                display: 'flex', gap: '12px', alignItems: 'center',
                background: 'rgba(10, 10, 15, 0.5)',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="form-control"
                style={{
                  flex: 1, borderRadius: '99px', padding: '10px 18px',
                  background: 'rgba(255, 255, 255, 0.04)',
                }}
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={!messageText.trim() || sending}
                className="btn btn-primary"
                style={{
                  borderRadius: '50%', width: '42px', height: '42px', padding: 0,
                  flexShrink: 0, opacity: messageText.trim() ? 1 : 0.5,
                }}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          /* No conversation selected */
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%', color: 'var(--text-muted)',
          }}
          className="empty-chat-state"
          >
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: 'rgba(0, 216, 255, 0.08)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', marginBottom: '20px',
            }}>
              <MessageSquare size={36} style={{ color: 'var(--neon-blue)', opacity: 0.5 }} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Your Messages
            </h3>
            <p style={{ fontSize: '14px', maxWidth: '300px', textAlign: 'center' }}>
              Select a conversation or chat with a seller from a product page.
            </p>
          </div>
        )}
      </main>

      <style>{`
        .conv-item:hover {
          background: rgba(255, 255, 255, 0.03) !important;
        }
        @media (max-width: 768px) {
          .chat-sidebar {
            position: absolute; inset: 0; z-index: 10;
            width: 100% !important;
          }
          .chat-sidebar[style*="display: undefined"] { display: none !important; }
          .mobile-back-btn { display: block !important; }
          .empty-chat-state { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default ChatPage;
