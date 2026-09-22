import type { WorkResult } from "@/lib/simulate";

export function ResultCard({
  result,
  note,
}: Readonly<{ result: WorkResult; note?: string }>) {
  return (
    <div className="result-card">
      <div className="result-card-row">
        <span className="result-card-label">label</span>
        <span>{result.label}</span>
      </div>
      <div className="result-card-row">
        <span className="result-card-label">generated at</span>
        <span>{result.generatedAt}</span>
      </div>
      <div className="result-card-row">
        <span className="result-card-label">instance id</span>
        <span>{result.id}</span>
      </div>
      {note ? <p className="result-card-note">{note}</p> : null}
    </div>
  );
}
