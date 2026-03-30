import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold">\uD83E\uDDE0 AI Knowledge</h1>
          <div className="flex gap-4">
            <Link href="/sign-in" className="text-sm text-muted-foreground hover:text-foreground">Sign In</Link>
            <Link href="/sign-up" className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:opacity-90">Get Started Free</Link>
          </div>
        </div>
      </header>

      <section className="max-w-4xl mx-auto px-4 py-24 text-center">
        <h2 className="text-5xl font-bold tracking-tight mb-6">
          AI That Remembers <span className="text-orange-500">Everything</span> About You
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Stop repeating yourself to AI. Our assistant builds a persistent knowledge graph from your conversations, getting smarter with every interaction.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up" className="bg-primary text-primary-foreground px-8 py-3 rounded-lg text-lg font-medium hover:opacity-90">Start Free \u2192</Link>
          <Link href="#features" className="border px-8 py-3 rounded-lg text-lg font-medium hover:bg-secondary">Learn More</Link>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">How It Works</h3>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-4">\uD83D\uDCAC</div>
            <h4 className="text-lg font-semibold mb-2">Chat Naturally</h4>
            <p className="text-muted-foreground">Talk to your AI assistant like a colleague. Share context about your projects, preferences, and goals.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-4">\uD83E\uDDE0</div>
            <h4 className="text-lg font-semibold mb-2">Auto-Learn</h4>
            <p className="text-muted-foreground">Knowledge is automatically extracted from conversations and stored in your personal knowledge graph.</p>
          </div>
          <div className="p-6 border rounded-lg">
            <div className="text-3xl mb-4">\uD83D\uDD17</div>
            <h4 className="text-lg font-semibold mb-2">Smart Context</h4>
            <p className="text-muted-foreground">Every response is enriched with relevant knowledge. The more you chat, the better it understands you.</p>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Simple Pricing</h3>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6 border rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Free</h4>
            <p className="text-3xl font-bold mb-4">$0<span className="text-sm font-normal">/mo</span></p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>\u2713 50 knowledge entries</li>
              <li>\u2713 10 chats/day</li>
              <li>\u2713 Basic memory</li>
            </ul>
          </div>
          <div className="p-6 border-2 border-primary rounded-lg relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-full">Popular</div>
            <h4 className="text-lg font-semibold mb-2">Pro</h4>
            <p className="text-3xl font-bold mb-4">$19<span className="text-sm font-normal">/mo</span></p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>\u2713 500 knowledge entries</li>
              <li>\u2713 Unlimited chats</li>
              <li>\u2713 Knowledge graph view</li>
              <li>\u2713 Priority support</li>
            </ul>
          </div>
          <div className="p-6 border rounded-lg">
            <h4 className="text-lg font-semibold mb-2">Team</h4>
            <p className="text-3xl font-bold mb-4">$49<span className="text-sm font-normal">/mo</span></p>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>\u2713 Unlimited entries</li>
              <li>\u2713 Unlimited chats</li>
              <li>\u2713 Team knowledge sharing</li>
              <li>\u2713 Admin dashboard</li>
            </ul>
          </div>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-muted-foreground">
          \u00A9 2026 AI Knowledge SaaS. Built with Next.js + OpenAI.
        </div>
      </footer>
    </div>
  );
}
