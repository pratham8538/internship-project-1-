import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function PizzaDetails() {
  const { id } = useParams();
  const [pizza, setPizza] = useState(null);
  const [size, setSize] = useState('Medium');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  
  // Reviews state
  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    totalReviews: 0,
    averageRating: 4.5,
    breakdown: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
  });
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [ratingInput, setRatingInput] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentInput, setCommentInput] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  const { addItem } = useCart();
  const { user, token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const navigate = useNavigate();

  const sizeMultiplier = { Small: 0.85, Medium: 1, Large: 1.25 };

  const starLabels = {
    1: 'Needs improvement',
    2: 'Fair',
    3: 'Good & tasty',
    4: 'Delicious!',
    5: 'Artisanal masterpiece!',
  };

  const loadReviews = () => {
    setReviewsLoading(true);
    api.getPizzaReviews(id)
      .then((data) => setReviewsData(data))
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  };

  useEffect(() => {
    api.getPizza(id)
      .then((d) => setPizza(d.pizza))
      .catch(() => {});
    loadReviews();
  }, [id]);

  if (!pizza) return <div className="text-center py-24 text-on-surface-variant">Loading pizza…</div>;

  const price = +(pizza.price * sizeMultiplier[size]).toFixed(2);
  const fav = isFavorite(pizza.id);

  const handleAdd = () => {
    addItem({
      pizzaId: pizza.id,
      name: `${pizza.name} (${size})`,
      price,
      image: pizza.image,
      qty,
      customization: { size },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login', { state: { from: { pathname: `/pizza/${id}` } } });
      return;
    }
    if (!commentInput.trim()) {
      setReviewError('Please write a short review sharing your experience.');
      return;
    }

    setSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      await api.submitPizzaReview(id, { rating: ratingInput, comment: commentInput.trim() }, token);
      setCommentInput('');
      setRatingInput(5);
      setReviewSuccess('Thank you! Your review has been verified and posted.');
      loadReviews();
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err) {
      setReviewError(err.message || 'Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-20 py-10 animate-in fade-in duration-300">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sm text-on-surface-variant hover:text-primary mb-6 transition-colors">
        <span className="material-symbols-outlined text-base">arrow_back</span> Back
      </button>

      {/* Main Pizza Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden shadow-warm h-72 md:h-[450px] border border-outline-variant/30 relative group">
          <img src={pizza.image} alt={pizza.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          
          {/* Wishlist toggle pill */}
          <button
            type="button"
            onClick={() => toggleFavorite(pizza)}
            className={`absolute top-4 right-4 z-20 px-4 py-2 rounded-full flex items-center gap-2 transition-all shadow-lg backdrop-blur-md border ${
              fav
                ? 'bg-red-500/20 border-red-500/50 text-red-400'
                : 'bg-black/60 border-white/10 text-white hover:bg-black/80'
            }`}
          >
            <span className={`material-symbols-outlined text-lg ${fav ? 'icon-fill text-red-500' : ''}`}>favorite</span>
            <span className="text-xs font-bold uppercase tracking-wider">{fav ? 'Favorited' : 'Add to Favorites'}</span>
          </button>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-3 py-1 rounded-full font-bold uppercase tracking-wider">{pizza.category}</span>
            <span className="text-xs text-on-surface-variant font-medium">Authentic Wood-Fired</span>
          </div>

          <h1 className="font-display text-4xl font-extrabold text-on-surface mb-2">{pizza.name}</h1>

          {/* Rating Summary Link */}
          <div className="flex items-center gap-2 mb-5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined icon-fill text-base"
                  style={{ color: i < Math.round(reviewsData.averageRating || pizza.rating) ? '#C5A880' : '#27272A' }}
                >
                  star
                </span>
              ))}
            </div>
            <span className="text-sm text-primary font-bold">{reviewsData.averageRating || pizza.rating}</span>
            <span className="text-xs text-on-surface-variant">({reviewsData.totalReviews} customer reviews)</span>
            <a href="#reviews" className="text-xs text-primary font-semibold hover:underline ml-2">Read reviews ↓</a>
          </div>

          <p className="text-on-surface-variant text-body-lg mb-8 leading-relaxed">{pizza.description}</p>

          <div className="mb-6">
            <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-3">Size</p>
            <div className="flex gap-3">
              {Object.keys(sizeMultiplier).map((s) => (
                <button
                  key={s}
                  onClick={() => setSize(s)}
                  className={`px-5 py-2.5 rounded-full text-sm font-semibold border transition-all ${
                    size === s ? 'bg-primary text-on-primary border-primary shadow-glow scale-105' : 'border-outline text-on-surface-variant bg-surface hover:border-primary hover:text-primary'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-xs uppercase tracking-wider font-bold text-on-surface-variant mb-3">Quantity</p>
            <div className="flex items-center gap-4">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-all">−</button>
              <span className="font-bold text-lg w-6 text-center">{qty}</span>
              <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center font-bold hover:bg-primary/20 hover:text-primary transition-all">+</button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 pt-6 border-t border-outline-variant/30">
            <div>
              <span className="text-xs text-on-surface-variant block uppercase tracking-wider">Total Price</span>
              <span className="font-display text-3xl font-black text-primary">${(price * qty).toFixed(2)}</span>
            </div>
            <button
              onClick={handleAdd}
              className="bg-primary hover:bg-primary-hover text-on-primary font-bold px-8 py-4 rounded-full shadow-glow transition-all hover:scale-105 flex items-center gap-2"
            >
              <span className="material-symbols-outlined">{added ? 'check' : 'shopping_cart'}</span>
              {added ? 'Added to Cart!' : 'Add to Cart'}
            </button>
          </div>

          <div className="flex items-center gap-4 mt-6 pt-4 border-t border-outline-variant/20">
            <button onClick={() => navigate('/builder', { state: { base: pizza } })} className="text-sm font-bold text-primary hover:underline hover:text-primary-hover flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">tune</span> Customize this pizza
            </button>
            <span className="text-on-surface-variant/40">•</span>
            <Link to="/builder" className="text-sm font-bold text-on-surface-variant hover:text-primary flex items-center gap-1.5 transition-colors">
              <span className="material-symbols-outlined text-base">pie_chart</span> Create Half & Half
            </Link>
          </div>
        </div>
      </div>

      {/* REVIEWS & RATINGS SECTION */}
      <section id="reviews" className="mt-20 pt-10 border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-primary text-xs uppercase tracking-widest font-bold block mb-1">Customer Feedback</span>
            <h2 className="font-display text-3xl font-bold text-on-surface">Ratings & Verified Reviews</h2>
          </div>
          <span className="text-sm text-on-surface-variant">Real testimonials from verified diners</span>
        </div>

        {/* Rating Breakdown Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 bg-surface-container rounded-2xl p-6 md:p-8 border border-outline-variant/30 shadow-warm mb-10">
          <div className="flex flex-col items-center justify-center text-center border-b md:border-b-0 md:border-r border-outline-variant/30 pb-6 md:pb-0 md:pr-6">
            <span className="font-display text-6xl font-black text-primary">{reviewsData.averageRating}</span>
            <div className="flex items-center gap-1 my-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <span
                  key={i}
                  className="material-symbols-outlined icon-fill text-xl"
                  style={{ color: i < Math.round(reviewsData.averageRating) ? '#C5A880' : '#27272A' }}
                >
                  star
                </span>
              ))}
            </div>
            <p className="text-sm text-on-surface font-semibold">Overall Rating</p>
            <p className="text-xs text-on-surface-variant mt-0.5">Based on {reviewsData.totalReviews} reviews</p>
          </div>

          {/* Star Bar Breakdown */}
          <div className="flex flex-col justify-center gap-2 md:col-span-2">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewsData.breakdown[stars] || 0;
              const pct = reviewsData.totalReviews ? Math.round((count / reviewsData.totalReviews) * 100) : 0;
              return (
                <div key={stars} className="flex items-center gap-3 text-xs">
                  <span className="w-12 font-bold text-on-surface-variant flex items-center gap-1">
                    {stars} <span className="material-symbols-outlined icon-fill text-xs" style={{ color: '#C5A880' }}>star</span>
                  </span>
                  <div className="flex-1 h-2.5 bg-surface-container-high rounded-full overflow-hidden border border-outline-variant/20">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-[#E5C99E] rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="w-10 text-right text-on-surface-variant font-semibold">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Form & Review List Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Write a Review Box */}
          <div className="lg:col-span-1">
            <div className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 sticky top-28 shadow-warm">
              <h3 className="font-display font-bold text-lg text-on-surface mb-2">Write a Review</h3>
              <p className="text-xs text-on-surface-variant mb-5">Have you tasted this pizza? Share your honest thoughts with fellow pizza enthusiasts.</p>

              {reviewSuccess && (
                <div className="bg-primary/10 border border-primary/30 text-primary text-xs font-bold rounded-xl p-3 mb-4 animate-in fade-in">
                  ✓ {reviewSuccess}
                </div>
              )}

              {reviewError && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold rounded-xl p-3 mb-4 animate-in fade-in">
                  {reviewError}
                </div>
              )}

              <form onSubmit={handleSubmitReview} className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Your Rating</label>
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRatingInput(star)}
                        className="p-1 hover:scale-125 transition-transform"
                        title={`${star} Star`}
                      >
                        <span
                          className={`material-symbols-outlined text-2xl transition-colors ${
                            star <= (hoverRating || ratingInput) ? 'icon-fill' : ''
                          }`}
                          style={{ color: star <= (hoverRating || ratingInput) ? '#C5A880' : '#4A484D' }}
                        >
                          star
                        </span>
                      </button>
                    ))}
                    <span className="text-xs font-semibold text-primary ml-2">{starLabels[hoverRating || ratingInput]}</span>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-on-surface-variant block mb-2">Your Review</label>
                  <textarea
                    rows={4}
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Tell us about the crust, toppings, warmth, and flavor..."
                    className="w-full px-4 py-3 rounded-xl border border-outline bg-background/50 text-on-surface text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder-on-surface-variant/40"
                  />
                </div>

                {token ? (
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-primary hover:bg-primary-hover text-on-primary font-bold py-3 rounded-full shadow-glow transition-all hover:scale-[1.02] text-xs uppercase tracking-wider disabled:opacity-50"
                  >
                    {submittingReview ? 'Submitting…' : 'Post Review'}
                  </button>
                ) : (
                  <div className="text-center pt-2">
                    <p className="text-xs text-on-surface-variant mb-2">Please login to submit your review</p>
                    <Link
                      to="/login"
                      state={{ from: { pathname: `/pizza/${id}` } }}
                      className="inline-block w-full bg-surface-container-high border border-outline-variant hover:border-primary text-on-surface font-bold py-2.5 rounded-full text-xs uppercase tracking-wider transition-colors"
                    >
                      Login to Review
                    </Link>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <h3 className="font-display font-bold text-xl text-on-surface mb-2">
              Reviews ({reviewsData.totalReviews})
            </h3>

            {reviewsLoading ? (
              <div className="text-center py-12 text-on-surface-variant">Loading reviews…</div>
            ) : reviewsData.reviews.length === 0 ? (
              <div className="bg-surface-container rounded-2xl p-10 text-center border border-outline-variant/30">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">rate_review</span>
                <p className="font-bold text-on-surface">No reviews yet</p>
                <p className="text-xs text-on-surface-variant mt-1">Be the first to review this artisanal pizza!</p>
              </div>
            ) : (
              reviewsData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-surface-container rounded-2xl p-6 border border-outline-variant/30 shadow-warm warm-card animate-in fade-in duration-300"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/30 flex items-center justify-center font-display font-bold text-primary text-sm shadow-glow">
                        {rev.user_name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-on-surface text-sm">{rev.user_name}</h4>
                          <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">verified</span> Verified Diner
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant/70 mt-0.5">
                          {new Date(rev.created_at).toLocaleDateString(undefined, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Star count */}
                    <div className="flex items-center gap-0.5 bg-surface-container-high px-2.5 py-1 rounded-full border border-outline-variant/20">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className="material-symbols-outlined icon-fill text-xs"
                          style={{ color: i < rev.rating ? '#C5A880' : '#3F3E42' }}
                        >
                          star
                        </span>
                      ))}
                      <span className="text-xs font-bold text-primary ml-1">{rev.rating}.0</span>
                    </div>
                  </div>

                  <p className="text-sm text-on-surface-variant leading-relaxed pl-13">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
