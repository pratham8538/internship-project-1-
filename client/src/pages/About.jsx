export default function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
      <h1 className="font-display text-4xl font-bold text-on-surface mb-4">Our Story</h1>
      <p className="text-on-surface-variant text-body-lg mb-6">
        Pizzania began as a single wood-fired oven in a family kitchen, fueled by a simple belief: great pizza starts with great ingredients and honest craft. Today, we still hand-stretch every dough ball and simmer our sauce from scratch each morning.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 my-12">
        <img src="https://images.unsplash.com/photo-1513104890138-7c749659a591?w=700" className="rounded-xl shadow-warm h-72 object-cover w-full" alt="Pizzeria kitchen" />
        <div className="flex flex-col justify-center gap-4">
          <h2 className="font-display text-2xl font-bold">Crafted With Care</h2>
          <p className="text-on-surface-variant">From our 48-hour fermented dough to locally-sourced toppings, every pizza is built by hand and baked to order in our 900°F stone ovens.</p>
          <h2 className="font-display text-2xl font-bold mt-4">Community First</h2>
          <p className="text-on-surface-variant">We partner with local farms and give back to neighborhood programs, because a great pizzeria is also a great neighbor.</p>
        </div>
      </div>
    </div>
  );
}
