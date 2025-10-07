export default function SuccessPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
      <div className="space-y-4">
        <p className="text-5xl">🎉</p>
        <h1 className="text-3xl font-bold uppercase tracking-widest">Received</h1>
        <p className="max-w-md text-lg text-black/70">
          You climbed the board. Nothing else happens. Keep burning if you want to stay on top.
        </p>
      </div>
      <a
        href="/leaderboard"
        className="rounded-md border-2 border-black bg-mint px-4 py-2 font-mono text-sm uppercase tracking-wide text-black shadow-pixel hover:bg-mint/80"
      >
        View leaderboard
      </a>
      <a href="/" className="text-sm underline decoration-dotted underline-offset-4">
        Back to the furnace →
      </a>
    </main>
  );
}
