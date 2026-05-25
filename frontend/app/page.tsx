import Link from 'next/link'
import { Zap, Brain, TrendingUp, Clock, Code2, Shield } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#09090b] text-[#fafafa]">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1c1c1f] bg-[#09090b]/90 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="PrepPilot" className="w-8 h-8 rounded-lg object-cover" />
            <span className="font-display font-semibold text-[15px]">
              <span className="text-[#fafafa]">Prep</span>
              <span className="text-[#f59e0b]">Pilot</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-[#71717a] hover:text-[#fafafa] text-[13px] transition-colors">
              Dashboard
            </Link>
            <Link
              href="/login"
              className="bg-[#f59e0b] text-[#09090b] px-4 py-1.5 rounded-lg text-[13px] font-semibold hover:bg-[#d97706] transition-colors"
            >
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-36 pb-24 px-6 relative overflow-hidden">
        {/* Radial glow behind hero text */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 900px 500px at 50% 20%, rgba(245,158,11,0.06), transparent)' }}
        />
        <div className="max-w-3xl mx-auto text-center relative">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-[#1c1500] border border-[#78350f]/60 text-[12px]">
            <span className="pulse-dot w-1.5 h-1.5 rounded-full bg-[#f59e0b] inline-block" />
            <span className="text-[#d97706]">Powered by</span>
            <span className="text-[#f59e0b] font-medium">Hermes Agent</span>
            <span className="text-[#52525b]">·</span>
            <span className="text-[#52525b]">MIT License · $0</span>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.2rem, 5vw, 3.5rem)' }}>
            The interview coach that{' '}
            <span className="text-[#f59e0b]" style={{ textShadow: '0 0 40px rgba(245,158,11,0.3)' }}>
              learns how you think.
            </span>
          </h1>

          {/* Sub */}
          <p className="text-[#71717a] text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            PrepPilot builds a persistent model of your thinking patterns, adapts every problem and feedback to your weak areas, and gets measurably smarter every session. No resets. No one-size-fits-all.
          </p>

          {/* CTAs */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-[#f59e0b] text-[#09090b] px-6 py-3 rounded-xl font-semibold text-[15px] hover:bg-[#d97706] active:scale-95 transition-all shadow-glow-amber-sm"
            >
              <Code2 size={16} /> Start locally
            </Link>
            <Link
              href="/solve"
              className="flex items-center gap-2 bg-transparent border border-[#3f3f46] text-[#a1a1aa] px-6 py-3 rounded-xl font-medium text-[15px] hover:border-[#52525b] hover:text-[#fafafa] transition-all"
            >
              Open Solve Workspace →
            </Link>
          </div>

          {/* Social proof */}
          <p className="text-[#3f3f46] text-[12px] mt-6 font-mono">
            MIT licensed · runs locally · costs $0 · built on Hermes Agent by Nous Research
          </p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-[#1c1c1f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-3 font-medium">How it works</p>
            <h2 className="font-display font-bold text-3xl">Three steps. Then it runs itself.</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                title: 'Create a local profile',
                body: 'Use an email and password on this machine. Each profile gets separate sessions, custom problems, assessment, and Hermes memory.',
                icon: <Shield size={18} className="text-[#f59e0b]" />,
              },
              {
                step: '02',
                title: 'Get your daily problem and paste your solution',
                body: 'Every morning at your chosen time. Hermes reviews your code in 15 seconds — correctness, complexity, edge cases — in your preferred explanation style.',
                icon: <Brain size={18} className="text-[#f59e0b]" />,
              },
              {
                step: '03',
                title: 'Watch the AI learn your patterns',
                body: 'Skills evolve. Version numbers increment. By week 3, the coaching is visibly different from week 1 — because Hermes has been watching you.',
                icon: <TrendingUp size={18} className="text-[#f59e0b]" />,
              },
            ].map((item, i) => (
              <div key={i} className={`bg-[#111113] border border-[#27272a] rounded-2xl p-7 hover:border-[#3f3f46] transition-colors fade-up delay-${i}`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="font-mono text-[11px] text-[#f59e0b] font-semibold tracking-widest">{item.step}</span>
                  {item.icon}
                </div>
                <h3 className="font-semibold text-[#fafafa] text-[16px] mb-2 leading-snug">{item.title}</h3>
                <p className="text-[#71717a] text-[13px] leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skill Evolution preview — THE differentiator */}
      <section className="py-20 px-6 border-t border-[#1c1c1f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[11px] text-[#52525b] uppercase tracking-widest mb-3 font-medium">The learning loop</p>
            <h2 className="font-display font-bold text-3xl mb-3">The AI that shows its work.</h2>
            <p className="text-[#71717a] text-base max-w-xl mx-auto">
              Most tools give you content. PrepPilot shows you exactly how it's learning to coach you better.
            </p>
          </div>

          {/* Diff preview */}
          <div className="rounded-2xl overflow-hidden border border-[#27272a] bg-[#0d0d0f]">
            {/* Toolbar */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-[#1c1c1f] bg-[#111113]">
              <span className="font-mono text-[12px] text-[#52525b]">problem_selector.md</span>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#27272a] text-[#71717a]">v1.0 — Day 1</span>
                <span className="text-[#3f3f46]">→</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#451a03] border border-[#78350f]/60 text-[#f59e0b]">v1.4 — Day 14</span>
              </div>
            </div>

            <div className="grid grid-cols-2 divide-x divide-[#1c1c1f]">
              {/* v1.0 */}
              <div className="p-5 font-mono text-[12px] leading-relaxed">
                <div className="text-[#71717a] space-y-0.5">
                  {`# skill: problem_selector
version: 1.0

## task
Select the most relevant problem.

## steps
1. Find lowest average score
2. Apply difficulty setting
3. Return unseen problem

## improvement_log
v1.0: Initial version.`.split('\n').map((l, i) => (
                    <div key={i} className={l.startsWith('##') ? 'text-[#52525b]' : l.startsWith('version') ? 'text-[#3f3f46]' : ''}>
                      {l || '\u00A0'}
                    </div>
                  ))}
                </div>
              </div>

              {/* v1.4 */}
              <div className="p-5 font-mono text-[12px] leading-relaxed relative">
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse 300px 200px at 80% 20%, rgba(245,158,11,0.04), transparent)' }}
                />
                {[
                  { text: '# skill: problem_selector', new: false },
                  { text: 'version: 1.4', new: false },
                  { text: 'last_improved: 2026-05-14', new: true },
                  { text: '', new: false },
                  { text: '## selection_algorithm', new: true },
                  { text: '1. identify_focus_area:', new: true },
                  { text: '   - recency bias: 3+ days', new: true },
                  { text: '   - weight by score drop', new: true },
                  { text: '2. spaced_repetition:', new: true },
                  { text: '   - score <50: review 1d', new: true },
                  { text: '   - score 50-70: review 3d', new: true },
                  { text: '3. problem_type_weighting:', new: true },
                  { text: '   - prefer BFS over DFS', new: true },
                  { text: '   for this user', new: true },
                  { text: '', new: false },
                  { text: '## improvement_log', new: false },
                  { text: 'v1.0: Initial version.', new: false },
                  { text: 'v1.1: Added recency bias.', new: true },
                  { text: 'v1.2: Plateau detection.', new: true },
                  { text: 'v1.3: Spaced repetition.', new: true },
                  { text: 'v1.4: Problem type weights.', new: true },
                ].map((line, i) => (
                  <div
                    key={i}
                    className={line.new
                      ? 'bg-[rgba(245,158,11,0.08)] border-l-2 border-[#f59e0b] pl-1.5 -ml-2 text-[#fde68a]'
                      : line.text.startsWith('##') ? 'text-[#52525b]' : 'text-[#71717a]'
                    }
                  >
                    {line.text || '\u00A0'}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#1c1c1f] flex items-center gap-2 bg-[#0d0d0f]">
              <Zap size={12} className="text-[#f59e0b]" />
              <span className="text-[11px] text-[#71717a]">
                <span className="text-[#a1a1aa]">Triggered by:</span> User failed 3 consecutive DFS-recursive problems while succeeding on BFS variants
              </span>
            </div>
          </div>

          <p className="text-center text-[#52525b] text-[13px] mt-5">
            Day 1 skill file: 12 lines. Day 14: 62 lines of learned intelligence. You didn't write any of it.
          </p>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-20 px-6 border-t border-[#1c1c1f]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="font-display font-bold text-3xl mb-3">Six Hermes capabilities. All doing real work.</h2>
            <p className="text-[#71717a] text-base">Not just scheduling and delivery — every capability is load-bearing.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: <Brain size={16} />, title: 'Self-Improving Skills', body: 'Three Hermes skills evolve independently — problem selector, solution reviewer, coaching profiler. Version history visible in your dashboard.' },
              { icon: <Shield size={16} />, title: 'Persistent Memory', body: 'Every session stored in FTS5 cross-session memory. Hermes never forgets a problem you attempted or a pattern you showed.' },
              { icon: <TrendingUp size={16} />, title: 'Honcho User Modeling', body: 'Dialectic user modeling builds a deepening inference about your thinking style, explanation preferences, and success patterns.' },
              { icon: <Zap size={16} />, title: 'Parallel Subagents', body: 'Correctness, complexity, and pattern analysis run in parallel. Three subagents, one coherent review in under 15 seconds.' },
              { icon: <Clock size={16} />, title: 'Local Cadence', body: 'Daily problem timing and weekly coaching settings stay attached to the active local profile.' },
              { icon: <Code2 size={16} />, title: 'Full Solve Workspace', body: 'Problem selector, custom problems, Monaco editor, Hermes review, score breakdown, and feedback rating in one browser workspace.' },
            ].map((f, i) => (
              <div key={i} className="bg-[#111113] border border-[#27272a] rounded-xl p-6 hover:border-[#3f3f46] transition-colors">
                <div className="w-8 h-8 rounded-lg bg-[#1c1500] border border-[#78350f]/40 flex items-center justify-center mb-3 text-[#f59e0b]">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-[#fafafa] text-[14px] mb-1.5">{f.title}</h3>
                <p className="text-[#71717a] text-[12px] leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 border-t border-[#1c1c1f]">
        <div className="max-w-xl mx-auto text-center">
          <div
            className="rounded-2xl p-12 border border-[#78350f]/40"
            style={{ background: 'radial-gradient(ellipse 600px 300px at 50% 50%, rgba(245,158,11,0.06), transparent), #0d0d0f' }}
          >
            <h2 className="font-display font-bold text-3xl mb-3">Ready to start?</h2>
            <p className="text-[#71717a] mb-8">Create a local profile and solve your first Hermes-reviewed problem.</p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 bg-[#f59e0b] text-[#09090b] px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-[#d97706] transition-all shadow-glow-amber-md active:scale-95"
            >
              <Code2 size={16} /> Start Local Profile
            </Link>
            <p className="text-[#3f3f46] text-[11px] mt-5 font-mono">
              Local SQLite · free forever · MIT licensed
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1c1c1f] py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-[#f59e0b] flex items-center justify-center">
              <span className="font-display font-bold text-[#09090b] text-[10px]">P</span>
            </div>
            <span className="text-[#52525b] text-[12px]">PrepPilot · MIT License</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#3f3f46] text-[11px] font-mono">
            <Zap size={10} />
            <span>Built on Hermes Agent by Nous Research</span>
          </div>
          <div className="flex gap-4 text-[12px] text-[#52525b]">
            <Link href="/dashboard" className="hover:text-[#a1a1aa] transition-colors">Dashboard</Link>
            <Link href="https://hermes-agent.nousresearch.com" className="hover:text-[#a1a1aa] transition-colors">Hermes Agent</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
