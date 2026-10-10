export default function Hero() {
  const scrollToShop = (e) => {
    e.preventDefault()
    document.getElementById('shop')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section id="home" className="relative w-full w-screen max-w-none overflow-hidden bg-black">
      {/* Video is strictly non-interactive — only the SHOP NOW button below is clickable. */}
      <video
        className="pointer-events-none block aspect-video h-auto w-full w-screen max-w-none object-contain select-none md:aspect-auto md:h-[500px] md:object-cover lg:h-[600px]"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/assets/mejdhool.jpg"
        aria-hidden="true"
        tabIndex={-1}
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
        <source src="/assets/hero-banner.mp4" type="video/mp4" />
      </video>
      {/* Precise tap target strictly over the baked-in SHOP NOW box area (bottom-center). */}
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-[9%] md:pb-10">
        <a
          href="#shop"
          onClick={scrollToShop}
          aria-label="Shop now — browse products"
          className="pointer-events-auto inline-flex min-h-[52px] items-center gap-2 rounded-full bg-gold px-9 py-3.5 text-base font-bold tracking-wide text-emerald-ink uppercase shadow-[0_8px_30px_rgba(0,0,0,0.45)] transition hover:scale-105 hover:bg-gold-soft focus-visible:ring-4 focus-visible:ring-white/70 focus-visible:outline-none active:scale-95 md:min-h-[56px] md:px-11 md:py-4 md:text-lg"
        >
          Shop Now
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  )
}
