// Section 08 — a final personal message.
export default function FinalNote({ student }) {
  const paras = student.finalMessage.split('\n\n');
  return (
    <article className="final paper paper--framed">
      {paras.map((p, i) => (
        <p key={i} className={i === 0 ? 'final-p final-first' : 'final-p'}>
          {p}
        </p>
      ))}
      <p className="signoff hand">
        With lots of appreciation,
        <br />
        Your Shadha Mam ❤️
      </p>
    </article>
  );
}
