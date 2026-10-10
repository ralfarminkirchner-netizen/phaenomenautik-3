export function ShoreScene({ marked = false }: { marked?: boolean }) {
  return <div className="shore-scene" aria-hidden="true">
    <img src="/images/flimmerbucht.png" alt="" className="shore-art" />
    <div className="shore-shade" />
    {marked && <div className="shore-marker">
      <svg viewBox="0 0 72 100"><ellipse cx="36" cy="86" rx="31" ry="5" fill="#c2ded6" opacity=".45" /><path d="M36 14v34" stroke="#e8e8da" strokeWidth="3" /><path d="M38 15l15 9-15 8" fill="#eed3a8" /><path d="M25 48h22l7 27q-18 15-36 0z" fill="#f1f3ec" stroke="#244551" strokeWidth="2" /><path d="M23 66h26" stroke="#607e83" strokeWidth="4" /></svg>
      <span>Deine Markierung</span>
    </div>}
  </div>;
}
