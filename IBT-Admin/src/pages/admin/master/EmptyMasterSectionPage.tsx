export function EmptyMasterSectionPage({
  title,
}: {
  title: string
}) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] place-items-center p-4 md:p-6">
      <section className="w-full max-w-2xl rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-white p-8 text-center shadow-[var(--ui-shadow-md)]">
        <p className="text-base font-semibold text-[var(--ui-text)]">{title}</p>
        <p className="mt-2 text-sm text-[var(--ui-muted)]">This subsection page is intentionally empty for now. We will build its dedicated CRUD and logic next.</p>
      </section>
    </div>
  )
}
