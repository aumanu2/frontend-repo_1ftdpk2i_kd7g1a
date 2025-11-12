import { useEffect, useMemo, useState } from 'react'
import Spline from '@splinetool/react-spline'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Trophy, User, LogIn, UserPlus, Upload, Flag, ChevronRight } from 'lucide-react'

function App() {
  const BASE_URL = useMemo(() => import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000', [])

  const [mobileOpen, setMobileOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const [auth, setAuth] = useState({ username: '' })

  // Leaderboard
  const [board, setBoard] = useState([])

  // Challenges
  const [challenges, setChallenges] = useState([])

  // Forms
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' })
  const [contribForm, setContribForm] = useState({ title: '', description: '', flag: '', points: 100, tags: '' })
  const [submitForm, setSubmitForm] = useState({ challenge_id: '', flag: '' })

  const showToast = (msg, type = 'info') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2500)
  }

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/leaderboard`)
      const data = await res.json()
      if (data.ok) setBoard(data.items)
    } catch (e) { /* ignore */ }
  }

  const fetchChallenges = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/challenges`)
      const data = await res.json()
      if (data.ok) setChallenges(data.items)
    } catch (e) { /* ignore */ }
  }

  useEffect(() => {
    fetchLeaderboard()
    fetchChallenges()
  }, [])

  const handleRegister = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Register failed')
      setAuth({ username: registerForm.username })
      setRegisterForm({ username: '', email: '', password: '' })
      showToast('Registrasi berhasil')
    } catch (err) {
      showToast(err.message || 'Gagal registrasi', 'error')
    } finally { setLoading(false) }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      setAuth({ username: data.username })
      setLoginForm({ username: '', password: '' })
      showToast('Berhasil masuk')
    } catch (err) {
      showToast(err.message || 'Gagal login', 'error')
    } finally { setLoading(false) }
  }

  const handleContribute = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        title: contribForm.title,
        description: contribForm.description,
        flag: contribForm.flag,
        points: Number(contribForm.points) || 0,
        tags: contribForm.tags ? contribForm.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      const res = await fetch(`${BASE_URL}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Gagal kirim tantangan')
      showToast('Tantangan dikirim!')
      setContribForm({ title: '', description: '', flag: '', points: 100, tags: '' })
      fetchChallenges()
    } catch (err) {
      showToast(err.message || 'Gagal mengirim tantangan', 'error')
    } finally { setLoading(false) }
  }

  const handleSubmitFlag = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`${BASE_URL}/api/submit-flag`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitForm)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Flag salah')
      showToast('Flag benar! +score')
      setSubmitForm({ challenge_id: '', flag: '' })
      fetchLeaderboard()
    } catch (err) {
      showToast(err.message || 'Flag salah', 'error')
    } finally { setLoading(false) }
  }

  const Section = ({ id, children, className = '' }) => (
    <section id={id} className={`w-full py-20 px-4 sm:px-8 lg:px-12 ${className}`}>{children}</section>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-zinc-50 text-zinc-900">
      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-40 border-b border-zinc-200 bg-white/70 backdrop-blur">
        <div className="max-w-7xl mx-auto flex items-center justify-between py-3 px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-zinc-900" />
            <span className="font-extrabold tracking-wide">MANGESTIC CTF</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm">
            <a href="#home" className="hover:text-black">Home</a>
            <a href="#leaderboard" className="hover:text-black">Leaderboard</a>
            <a href="#profile" className="hover:text-black">Profile</a>
            <a href="#auth" className="hover:text-black">Login</a>
            <a href="#contribute" className="hover:text-black">Contribute</a>
          </nav>
          <button className="md:hidden" onClick={() => setMobileOpen(v => !v)} aria-label="toggle menu">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="md:hidden overflow-hidden border-t border-zinc-200 bg-white">
              <div className="px-4 py-3 flex flex-col gap-3 text-sm">
                {['home','leaderboard','profile','auth','contribute'].map(k => (
                  <a key={k} href={`#${k}`} onClick={() => setMobileOpen(false)} className="py-2">{k[0].toUpperCase()+k.slice(1)}</a>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero with Spline */}
      <section id="home" className="relative h-[78vh] w-full pt-16">
        <div className="absolute inset-0">
          <Spline scene="https://prod.spline.design/zhZFnwyOYLgqlLWk/scene.splinecode" style={{ width: '100%', height: '100%' }} />
        </div>
        {/* Soft gradient overlay for text legibility */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white/80 pointer-events-none" />
        <div className="relative h-full max-w-7xl mx-auto flex items-center px-4 sm:px-8">
          <div className="max-w-2xl">
            <motion.h1 initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-6xl font-extrabold tracking-tight text-zinc-900">
              Rise to the top. Dominate the board.
            </motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.1, duration: 0.6 }} className="mt-4 text-zinc-700 text-lg">
              Platform CTF modern dengan palet monokrom. Tantang dirimu, pecahkan flag, dan melesat ke puncak leaderboard.
            </motion.p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a href="#leaderboard" className="group inline-flex items-center gap-2 bg-zinc-900 text-white px-5 py-2.5 rounded-md">
                <Trophy size={18} /> Lihat Leaderboard
                <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </a>
              <a href="#auth" className="inline-flex items-center gap-2 border border-zinc-300 px-5 py-2.5 rounded-md hover:bg-zinc-100">
                <LogIn size={18} /> Mulai
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard */}
      <Section id="leaderboard" className="bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 grid place-items-center rounded bg-zinc-900 text-white"><Trophy size={18} /></div>
            <h2 className="text-2xl sm:text-3xl font-bold">Leaderboard</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {board.length === 0 && (
              <p className="text-zinc-500">Belum ada skor. Jadilah yang pertama!</p>
            )}
            {board.map((row, i) => (
              <motion.div key={row.username} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} className="border border-zinc-200 rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-zinc-100 grid place-items-center font-semibold">{i+1}</div>
                    <div>
                      <div className="font-semibold">{row.username}</div>
                      <div className="text-sm text-zinc-500">Poin: {row.score}</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* Profile */}
      <Section id="profile" className="bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 grid place-items-center rounded bg-zinc-900 text-white"><User size={18} /></div>
            <h2 className="text-2xl sm:text-3xl font-bold">Profile</h2>
          </div>
          {auth.username ? (
            <div className="border border-zinc-200 rounded-lg p-6 bg-white max-w-xl">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-zinc-200" />
                <div>
                  <div className="font-semibold text-lg">{auth.username}</div>
                  <div className="text-sm text-zinc-500">Selamat datang kembali</div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-zinc-500">Masuk untuk melihat profil Anda.</p>
          )}
        </div>
      </Section>

      {/* Auth */}
      <Section id="auth" className="bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          {/* Login */}
          <div className="border border-zinc-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-2 mb-4"><LogIn size={18} /><h3 className="font-semibold">Login</h3></div>
            <form onSubmit={handleLogin} className="space-y-3">
              <input required value={loginForm.username} onChange={e=>setLoginForm(s=>({...s, username:e.target.value}))} placeholder="Username" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <input required type="password" value={loginForm.password} onChange={e=>setLoginForm(s=>({...s, password:e.target.value}))} placeholder="Password" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <button disabled={loading} className="w-full bg-zinc-900 text-white rounded-md py-2 flex items-center justify-center gap-2">
                <LogIn size={16} /> Masuk
              </button>
            </form>
          </div>
          {/* Register */}
          <div className="border border-zinc-200 rounded-xl p-6 bg-white">
            <div className="flex items-center gap-2 mb-4"><UserPlus size={18} /><h3 className="font-semibold">Register</h3></div>
            <form onSubmit={handleRegister} className="space-y-3">
              <input required value={registerForm.username} onChange={e=>setRegisterForm(s=>({...s, username:e.target.value}))} placeholder="Username" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <input required type="email" value={registerForm.email} onChange={e=>setRegisterForm(s=>({...s, email:e.target.value}))} placeholder="Email" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <input required type="password" value={registerForm.password} onChange={e=>setRegisterForm(s=>({...s, password:e.target.value}))} placeholder="Password" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <button disabled={loading} className="w-full bg-zinc-900 text-white rounded-md py-2 flex items-center justify-center gap-2">
                <UserPlus size={16} /> Daftar
              </button>
            </form>
          </div>
        </div>
      </Section>

      {/* Contribute */}
      <Section id="contribute" className="bg-zinc-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-8 w-8 grid place-items-center rounded bg-zinc-900 text-white"><Upload size={18} /></div>
            <h2 className="text-2xl sm:text-3xl font-bold">Contribute Challenge</h2>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            <form onSubmit={handleContribute} className="border border-zinc-200 rounded-xl p-6 bg-white space-y-3">
              <input required value={contribForm.title} onChange={e=>setContribForm(s=>({...s, title:e.target.value}))} placeholder="Judul" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <textarea required rows={5} value={contribForm.description} onChange={e=>setContribForm(s=>({...s, description:e.target.value}))} placeholder="Deskripsi" className="w-full border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              <div className="grid sm:grid-cols-3 gap-3">
                <input required value={contribForm.flag} onChange={e=>setContribForm(s=>({...s, flag:e.target.value}))} placeholder="Flag" className="border border-zinc-300 rounded-md px-3 py-2 bg-white" />
                <input type="number" min={0} value={contribForm.points} onChange={e=>setContribForm(s=>({...s, points:e.target.value}))} placeholder="Points" className="border border-zinc-300 rounded-md px-3 py-2 bg-white" />
                <input value={contribForm.tags} onChange={e=>setContribForm(s=>({...s, tags:e.target.value}))} placeholder="Tags (comma)" className="border border-zinc-300 rounded-md px-3 py-2 bg-white" />
              </div>
              <button disabled={loading} className="bg-zinc-900 text-white rounded-md px-4 py-2 inline-flex items-center gap-2">
                <Upload size={16} /> Kirim Tantangan
              </button>
            </form>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-zinc-500"><Flag size={16} /> Tantangan aktif</div>
              <div className="grid gap-3">
                {challenges.length === 0 && (
                  <p className="text-zinc-500">Belum ada tantangan.</p>
                )}
                {challenges.map(ch => (
                  <div key={ch._id} className="border border-zinc-200 rounded-lg p-4 bg-white">
                    <div className="font-semibold">{ch.title} <span className="text-xs text-zinc-500">• {ch.points} pts</span></div>
                    <p className="text-sm text-zinc-600 mt-1 line-clamp-3">{ch.description}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {(ch.tags || []).map(tag => (
                        <span key={tag} className="text-xs px-2 py-1 rounded bg-zinc-100 border border-zinc-200">{tag}</span>
                      ))}
                    </div>
                    <details className="mt-3">
                      <summary className="text-sm text-zinc-700 cursor-pointer">Submit flag</summary>
                      <form onSubmit={(e)=>{ setSubmitForm(s=>({...s, challenge_id: ch._id})); handleSubmitFlag(e) }} className="mt-2 flex flex-col sm:flex-row gap-2">
                        <input required value={submitForm.challenge_id === ch._id ? submitForm.flag : ''} onChange={e=> setSubmitForm({ challenge_id: ch._id, flag: e.target.value })} placeholder="CTF{...}" className="flex-1 border border-zinc-300 rounded-md px-3 py-2 bg-white" />
                        <button disabled={loading} className="px-4 py-2 rounded-md bg-zinc-900 text-white">Kirim</button>
                      </form>
                    </details>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      <footer className="border-t border-zinc-200 py-10 text-center text-sm text-zinc-500 bg-white">
        © {new Date().getFullYear()} MANGESTIC CTF. All rights reserved.
      </footer>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }} className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-md shadow-lg ${toast.type === 'error' ? 'bg-zinc-900 text-white' : 'bg-white border border-zinc-200 text-zinc-900'}`}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
