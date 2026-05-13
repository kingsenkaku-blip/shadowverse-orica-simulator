import type { LogEntry } from "../engine/types";

interface LogPanelProps {
  logs: LogEntry[];
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section className="panel logPanel" aria-label="Battle log">
      <div className="panelHeader">
        <h2>Log</h2>
        <span>{logs.length}</span>
      </div>
      <ol>
        {logs.map((entry) => (
          <li key={entry.id}>{entry.text}</li>
        ))}
      </ol>
    </section>
  );
}
