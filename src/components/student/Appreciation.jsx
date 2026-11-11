// Section 02 — the heartfelt appreciation note.
export default function Appreciation({ student }) {
  const paras = student.appreciationMessage.split('\n\n');
  return (
    <article className="note paper paper--framed">
      <p className="note-kicker hand">A note for {student.name}</p>
      {paras.map((p, i) => (
        <p key={i} className={i === 0 ? 'note-p dropcap' : 'note-p'}>
          {p}
        </p>
      ))}
      <p className="sign hand">— Your Shadha Mam ❤️</p>
    </article>
  );
}
