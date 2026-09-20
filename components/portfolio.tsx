'use client'

import dynamic from 'next/dynamic'
import { useCallback, useEffect, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, AudioLines, Box, BriefcaseBusiness, ChevronDown, Code2, FileBadge2, Fingerprint, Layers3, Mail, Menu, Mouse, RotateCcw, Users, X } from 'lucide-react'
import type { District } from './city-scene'
import { PortfolioSections } from './portfolio-sections'

const CityScene = dynamic(() => import('./city-scene'), { ssr: false })
const navigation: { id: District; title: string; description: string; icon: typeof Fingerprint }[] = [
  { id: 'about', title: 'About', description: 'The person behind the code', icon: Fingerprint },
  { id: 'skills', title: 'Skills', description: 'My technology toolkit', icon: Code2 },
  { id: 'projects', title: 'Projects', description: 'Ideas turned into reality', icon: Layers3 },
  { id: 'experience', title: 'Experience', description: 'My professional journey', icon: BriefcaseBusiness },
  { id: 'certificates', title: 'Certificates', description: 'Learning without limits', icon: FileBadge2 },
  { id: 'others', title: 'Others', description: 'Beyond the classroom', icon: Users },
  { id: 'contact', title: 'Contact', description: 'Let’s build together', icon: Mail },
]
const roles = ['AI & ML Developer', 'Engineering Student', 'Problem Solver']

function TypedRole({ reduced }: { reduced: boolean }) {
  const [text, setText] = useState(roles[0])
  useEffect(() => {
    if (reduced) return
    let role = 0, count = roles[0].length, deleting = true
    let timer: ReturnType<typeof setTimeout>
    const tick = () => {
      if (deleting) count--
      else count++
      setText(roles[role].slice(0, count))
      let delay = deleting ? 40 : 85
      if (count === 0) { deleting = false; role = (role + 1) % roles.length; delay = 220 }
      else if (count === roles[role].length && !deleting) { deleting = true; delay = 3200 }
      timer = setTimeout(tick, delay)
    }
    timer = setTimeout(tick, 3800)
    return () => clearTimeout(timer)
  }, [reduced])
  return <div className="hero-role"><span aria-hidden="true">{reduced ? roles[0] : text}<span className="typing-cursor" /></span><span className="sr-only">AI and ML Developer, Engineering Student, Problem Solver</span></div>
}

export default function Portfolio() {
  const [active, setActive] = useState<District>('home')
  const [menuOpen, setMenuOpen] = useState(false)
  const [motion, setMotion] = useState(false)
  const [reduced, setReduced] = useState(true)
  const [ready, setReady] = useState(false)
  const [sound, setSound] = useState(false)

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const mobile = window.matchMedia('(max-width: 767px)')
    const update = () => { setReduced(media.matches); setMotion(!media.matches && !mobile.matches) }
    update()
    media.addEventListener('change', update)
    mobile.addEventListener('change', update)
    return () => {
      media.removeEventListener('change', update)
      mobile.removeEventListener('change', update)
    }
  }, [])

  useEffect(() => {
    const update = () => {
      const ids: District[] = ['home', ...navigation.map(n => n.id)]
      const center = window.innerHeight * .45
      const current = ids.find(id => {
        const rect = document.getElementById(id)?.getBoundingClientRect()
        return rect && rect.top <= center && rect.bottom > center
      })
      if (current) setActive(current)
    }
    window.addEventListener('scroll', update, { passive: true })
    update()
    return () => window.removeEventListener('scroll', update)
  }, [])

  useEffect(() => {
    if (!menuOpen) return
    const escape = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenuOpen(false) }
    window.addEventListener('keydown', escape)
    return () => window.removeEventListener('keydown', escape)
  }, [menuOpen])

  const navigate = useCallback((id: District) => {
    setMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
    window.history.replaceState(null, '', `#${id}`)
  }, [])
  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setReady(true), [])

  // A quiet synthesized atmosphere avoids external audio assets and starts only after an explicit gesture.
  useEffect(() => {
    if (!sound) return
    const context = new AudioContext()
    const gain = context.createGain()
    gain.gain.value = .025
    gain.connect(context.destination)
    const oscillators = [55, 82.41, 110].map(frequency => {
      const oscillator = context.createOscillator()
      oscillator.type = 'sine'
      oscillator.frequency.value = frequency
      oscillator.connect(gain)
      oscillator.start()
      return oscillator
    })
    void context.resume()
    return () => { oscillators.forEach(osc => osc.stop()); void context.close() }
  }, [sound])

  return <div className={`portfolio font-sans ${active !== 'home' ? 'is-exploring' : ''}`}>
    <a href="#about" className="skip-link">Skip to portfolio content</a>
    <header className="site-header">
      <a href="#home" className="wordmark" aria-label="Piyush home">P<span>.</span></a>
      <nav className="desktop-nav" aria-label="Main navigation"><a href="#home" aria-current={active === 'home' ? 'location' : undefined}>Home</a>{navigation.map(n => <a key={n.id} href={`#${n.id}`} aria-current={active === n.id ? 'location' : undefined}>{n.title}</a>)}</nav>
      <a className="connect-button" href="#contact">Let&apos;s connect <ArrowUpRight size={16} /></a>
      <button className="mobile-menu-button" aria-label={menuOpen ? 'Close menu' : 'Open menu'} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={22} /> : <Menu size={22} />}</button>
      {menuOpen && <nav id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">{[{ id: 'home' as District, title: 'Home' }, ...navigation].map(n => <a key={n.id} href={`#${n.id}`} onClick={() => setMenuOpen(false)} aria-current={active === n.id ? 'location' : undefined}>{n.title}<ArrowUpRight size={17} /></a>)}</nav>}
    </header>

    <div className="city-world" aria-label="Interactive developer city">
      <div className="city-atmosphere" />
      <div className="city-canvas"><CityScene selected={active} onNavigate={navigate} onReady={onReady} onError={onError} /></div>
    </div>

    <main>
      <section id="home" className="hero" aria-labelledby="hero-title">
        <div className="hero-grid-label font-mono"><span className="status-dot" />A WORLD BUILT WITH PURPOSE<span className="grid-label-line" /></div>
        <div className="hero-copy">
          <div className="hero-eyebrow font-mono"><span className="eyebrow-line" />WELCOME TO MY DIGITAL WORLD</div>
          <h1 id="hero-title">PIYUSH<span>.DEV</span></h1>
          <TypedRole reduced={reduced || !motion} />
          <p className="hero-description">Building intelligent systems.<br />Turning ideas into real-world solutions.</p>
          <div className="hero-actions"><a className="primary-button" href="#about">Explore my city <ArrowRight size={18} /></a><a className="secondary-button" href="#projects">View projects <ArrowUpRight size={17} /></a></div>
          <div className="hero-footnote"><span className="footnote-line" /><span>Not just a portfolio. A world to explore.</span></div>
        </div>
        <div className="city-instruction font-mono"><span className="instruction-cross">+</span> HOVER TO DISCOVER <span className="instruction-divider">/</span> CLICK TO EXPLORE</div>
        <div className="hero-bottom"><div className="district-intro"><span className="small-label font-mono">ONE CITY. MANY POSSIBILITIES.</span><span>Choose your next destination <ArrowDown size={15} /></span></div><nav className="district-grid" aria-label="Explore city districts">{navigation.map(n => <a href={`#${n.id}`} key={n.id} className="district-card"><div className="district-card-top"><n.icon size={22} strokeWidth={1.4} /><ArrowUpRight size={14} className="district-arrow" /></div><span className="district-title">{n.title}</span><span className="district-description">{n.description}</span></a>)}</nav></div>
        <a className="scroll-marker font-mono" href="#about"><Mouse size={17} />SCROLL TO EXPLORE<ChevronDown size={14} /></a>
      </section>
      <PortfolioSections />
    </main>

    <nav className="chapter-dots" aria-label="Journey progress">{['home', ...navigation.map(n => n.id)].map((id, i) => <a key={id} href={`#${id}`} aria-label={`Go to ${id}`} aria-current={active === id ? 'location' : undefined}><span className="dot-number font-mono">0{i}</span><span className="progress-dot" /></a>)}</nav>
    <div className="experience-toolbar"><div className="location-status font-mono"><span className="status-dot" /><span className="location-name">{active === 'home' ? 'CITY OVERVIEW' : `${active.toUpperCase()} DISTRICT`}</span><span className="toolbar-divider" /><span className="toolbar-subtext">EXPLORE AT YOUR OWN PACE</span></div><div className="experience-controls"><button className="audio-button" onClick={() => setSound(!sound)} aria-label={sound ? 'Mute ambient sound' : 'Enable ambient sound'} aria-pressed={sound}><AudioLines size={15} /><span>SOUND {sound ? 'ON' : 'OFF'}</span></button><span className="toolbar-divider" /><span className="live-indicator" aria-label="Interactive 3D is live"><span className="status-dot" />3D LIVE</span><button className="reset-button" aria-label="Return to city overview" onClick={() => navigate('home')}><RotateCcw size={14} /></button></div></div>
    {!ready && <div className="city-loading font-mono" role="status"><Box size={15} /> INITIALIZING CITY<span className="loading-dots">...</span></div>}
  </div>
}
