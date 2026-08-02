import snarkdown from "snarkdown";

export function JobSection({ title, content }) {
  const html = snarkdown(content);

  return (
    <section>
      <h2>{title}</h2>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
}