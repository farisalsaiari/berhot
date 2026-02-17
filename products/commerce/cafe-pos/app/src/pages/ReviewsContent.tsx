import { useState, useEffect, useCallback } from 'react';
import { fetchReviews, replyToReview, fetchReviewStats, Review, ReviewStats } from '../lib/posApi';

interface Props {
  C: Record<string, string>;
  isLight: boolean;
  isMobile: boolean;
}

export default function ReviewsContent({ C, isLight, isMobile }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'replied'>('all');
  const [search, setSearch] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [r, s] = await Promise.all([fetchReviews(), fetchReviewStats()]);
      setReviews(r);
      setStats(s);
    } catch (e) {
      console.error('Failed to load reviews:', e);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredReviews = reviews.filter(r => {
    if (filter === 'pending' && r.merchantReply) return false;
    if (filter === 'replied' && !r.merchantReply) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (r.customerName || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleReply = async (id: string) => {
    if (!replyText.trim()) return;
    try {
      await replyToReview(id, replyText.trim());
      setReplyText('');
      setReplyingTo(null);
      loadData();
    } catch (e) {
      console.error('Failed to reply:', e);
    }
  };

  const renderStars = (rating: number, size = 16) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? '#f59e0b' : C.textLight, fontSize: size }}>
        ★
      </span>
    ));
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      });
    } catch { return dateStr; }
  };

  const cardStyle: React.CSSProperties = {
    background: C.card,
    border: `1px solid ${C.cardBorder}`,
    borderRadius: 14,
    padding: 20,
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <div style={{ color: C.textSecond, fontSize: 15 }}>Loading reviews...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: isMobile ? 16 : 30, maxWidth: 1000 }}>
      {/* Page title */}
      <h2 style={{ color: C.textPrimary, fontSize: 22, fontWeight: 700, margin: '0 0 24px 0' }}>
        Reviews
      </h2>

      {/* Stats Header */}
      {stats && (
        <div style={{ ...cardStyle, display: 'flex', gap: 32, flexWrap: 'wrap', marginBottom: 20, alignItems: 'center' }}>
          {/* Average rating */}
          <div style={{ textAlign: 'center', minWidth: 120 }}>
            <div style={{ fontSize: 42, fontWeight: 800, color: C.textPrimary, lineHeight: 1 }}>
              {stats.totalReviews > 0 ? stats.averageRating.toFixed(1) : '—'}
            </div>
            <div style={{ marginTop: 6 }}>{renderStars(Math.round(stats.averageRating), 18)}</div>
            <div style={{ color: C.textSecond, fontSize: 13, marginTop: 4 }}>
              {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
            </div>
          </div>

          {/* Rating distribution */}
          {stats.distribution && (
            <div style={{ flex: 1, minWidth: 200 }}>
              {[5, 4, 3, 2, 1].map(star => {
                const count = stats.distribution?.[String(star)] || 0;
                const pct = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
                return (
                  <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ color: C.textSecond, fontSize: 13, width: 20, textAlign: 'right' }}>{star}</span>
                    <span style={{ color: '#f59e0b', fontSize: 12 }}>★</span>
                    <div style={{
                      flex: 1, height: 8, background: isLight ? '#f0f0f0' : '#2a2a2a',
                      borderRadius: 4, overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${pct}%`, height: '100%',
                        background: '#f59e0b', borderRadius: 4,
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    <span style={{ color: C.textLight, fontSize: 12, width: 28, textAlign: 'right' }}>
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Filter tabs + Search */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        {(['all', 'pending', 'replied'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: filter === f ? `1.5px solid ${C.accent}` : `1px solid ${C.cardBorder}`,
              background: filter === f ? (isLight ? '#eff6ff' : 'rgba(59,130,246,0.12)') : 'transparent',
              color: filter === f ? C.accent : C.textSecond,
              fontSize: 13,
              fontWeight: filter === f ? 600 : 400,
              cursor: 'pointer',
            }}
          >
            {f === 'all' ? 'All' : f === 'pending' ? 'Pending Reply' : 'Replied'}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search reviews..."
          style={{
            padding: '8px 14px',
            borderRadius: 10,
            border: `1px solid ${C.cardBorder}`,
            background: C.card,
            color: C.textPrimary,
            fontSize: 13,
            outline: 'none',
            minWidth: 200,
          }}
        />
      </div>

      {/* Review cards */}
      {filteredReviews.length === 0 ? (
        <div style={{ ...cardStyle, textAlign: 'center', padding: 60 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>★</div>
          <div style={{ color: C.textSecond, fontSize: 15 }}>
            {reviews.length === 0 ? 'No reviews yet' : 'No reviews match your filter'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filteredReviews.map(review => (
            <div key={review.id} style={cardStyle}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: isLight ? '#e8f0fe' : '#1e3a5f',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: C.accent, fontWeight: 700, fontSize: 15,
                  flexShrink: 0,
                }}>
                  {(review.customerName || 'C').charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  {/* Name + Stars + Date */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                    <div>
                      <span style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14 }}>
                        {review.customerName || 'Customer'}
                      </span>
                      <span style={{ marginLeft: 8 }}>{renderStars(review.rating, 14)}</span>
                    </div>
                    <span style={{ color: C.textLight, fontSize: 12 }}>
                      {formatDate(review.createdAt)}
                    </span>
                  </div>

                  {/* Comment */}
                  {review.comment && (
                    <p style={{ color: C.textSecond, fontSize: 14, margin: '8px 0 0 0', lineHeight: 1.5 }}>
                      {review.comment}
                    </p>
                  )}

                  {/* Merchant Reply */}
                  {review.merchantReply && (
                    <div style={{
                      marginTop: 12, padding: 12,
                      background: isLight ? '#f8f9fa' : '#1a1a1a',
                      borderRadius: 10,
                      borderLeft: `3px solid ${C.accent}`,
                    }}>
                      <div style={{ color: C.accent, fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        Your Reply
                      </div>
                      <div style={{ color: C.textSecond, fontSize: 13 }}>
                        {review.merchantReply}
                      </div>
                      {review.merchantRepliedAt && (
                        <div style={{ color: C.textLight, fontSize: 11, marginTop: 4 }}>
                          {formatDate(review.merchantRepliedAt)}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Reply button / form */}
                  {!review.merchantReply && (
                    <div style={{ marginTop: 10 }}>
                      {replyingTo === review.id ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <input
                            type="text"
                            value={replyText}
                            onChange={e => setReplyText(e.target.value)}
                            placeholder="Write a reply..."
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleReply(review.id);
                            }}
                            style={{
                              flex: 1, padding: '8px 12px',
                              borderRadius: 8,
                              border: `1px solid ${C.cardBorder}`,
                              background: C.card,
                              color: C.textPrimary,
                              fontSize: 13,
                              outline: 'none',
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => handleReply(review.id)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: 8,
                              border: 'none',
                              background: C.accent,
                              color: '#fff',
                              fontSize: 13,
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Reply
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(''); }}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 8,
                              border: `1px solid ${C.cardBorder}`,
                              background: 'transparent',
                              color: C.textSecond,
                              fontSize: 13,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: 8,
                            border: `1px solid ${C.cardBorder}`,
                            background: 'transparent',
                            color: C.accent,
                            fontSize: 13,
                            fontWeight: 500,
                            cursor: 'pointer',
                          }}
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
