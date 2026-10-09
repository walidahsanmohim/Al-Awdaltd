export default function Hero() {
  return (
    <section id="home" className="w-full w-screen max-w-none overflow-hidden bg-black">
      <video
        className="block aspect-video h-auto w-full w-screen max-w-none object-contain md:aspect-auto md:h-[500px] md:object-cover lg:h-[600px]"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/assets/mejdhool.jpg"
      >
        <source src="/assets/hero-video.mp4" type="video/mp4" />
        <source src="/assets/hero-banner.mp4" type="video/mp4" />
      </video>
    </section>
  )
}
