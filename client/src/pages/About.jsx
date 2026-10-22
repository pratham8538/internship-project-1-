export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-20 animate-in fade-in duration-300">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="text-primary text-xs uppercase tracking-widest font-bold block mb-2">Our Legacy</span>
        <h1 className="font-display text-4xl md:text-5xl font-black uppercase tracking-wider text-on-surface mb-6">Our Story</h1>
        <p className="text-on-surface-variant text-lg leading-relaxed">
          Pizzania began as a single wood-fired oven in a family kitchen, fueled by a simple belief: great pizza starts with great ingredients and honest craft. Today, we still hand-stretch every dough ball and simmer our sauce from scratch each morning.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center my-12 border-t border-b border-outline-variant/20 py-16">
        <div className="rounded-2xl overflow-hidden shadow-warm border border-outline-variant/30 h-80">
          <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700" className="h-full w-full object-cover hover:scale-105 transition-transform duration-500" alt="Pizzeria kitchen" />
        </div>
        <div className="flex flex-col gap-6">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-on-surface mb-2 uppercase tracking-wide">Crafted With Care</h2>
            <p className="text-on-surface-variant leading-relaxed">From our 48-hour fermented dough to locally-sourced toppings, every pizza is built by hand and baked to order in our 900°F stone ovens.</p>
          </div>
          <div className="border-t border-outline-variant/10 pt-6">
            <h2 className="font-display text-2xl font-extrabold text-on-surface mb-2 uppercase tracking-wide">Community First</h2>
            <p className="text-on-surface-variant leading-relaxed">We partner with local farms and give back to neighborhood programs, because a great pizzeria is also a great neighbor.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
