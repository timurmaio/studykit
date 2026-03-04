interface SqlProblemFormHint {
  sqlHint: string;
  isOpen: boolean;
  isCopied: boolean;
  onToggle: () => void;
  onCopy: () => void;
}

interface SqlProblemFormProps {
  solution: string;
  onSolutionChange: (value: string) => void;
  onCheck: (e: React.FormEvent) => void;
  alert: string;
  checkingInformation: string;
  succeed: boolean | null;
  isChecking?: boolean;
  hint?: SqlProblemFormHint;
}

export function SqlProblemForm({
  solution,
  onSolutionChange,
  onCheck,
  alert,
  checkingInformation,
  succeed,
  isChecking = false,
  hint,
}: SqlProblemFormProps) {
  return (
    <form className="show-sql-form" onSubmit={onCheck}>
      <label htmlFor="solutionTextarea" className="show-sql-label">
        Введите сюда свое решение
      </label>
      {hint ? (
        <div className="show-sql-hint-wrap">
          <button type="button" className="show-sql-hint-toggle" onClick={hint.onToggle}>
            {hint.isOpen ? "Скрыть подсказку" : "Показать подсказку"}
          </button>
          {hint.isOpen ? (
            <div className="show-sql-hint-popover">
              <div className="show-sql-hint-header">
                <span>Правильный SQL</span>
                <button type="button" className="show-sql-copy" onClick={hint.onCopy}>
                  {hint.isCopied ? "Скопировано" : "Скопировать"}
                </button>
              </div>
              <pre className="show-sql-hint-code">{hint.sqlHint}</pre>
            </div>
          ) : null}
        </div>
      ) : null}
      <textarea
        className="block w-full py-2 px-3 text-base leading-snug text-[var(--color-text)] bg-[var(--color-surface)] border border-[var(--color-border-strong)] rounded-[6px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] focus-visible:outline-none focus-visible:[box-shadow:var(--focus-ring)] placeholder:text-[var(--color-text-muted)] disabled:bg-[var(--color-bg)] disabled:cursor-not-allowed mb-4 show-sql-textarea"
        name="solution"
        id="solutionTextarea"
        rows={6}
        value={solution}
        onChange={(e) => onSolutionChange(e.target.value)}
      />
      <button type="submit" className="button mb-4 show-sql-button" disabled={isChecking}>
        {isChecking ? "Проверка..." : "Отправить решение"}
      </button>
      {alert ? (
        <div className="alert alert-danger">{alert}</div>
      ) : null}
      {checkingInformation ? (
        <div
          className={`alert ${
            succeed === true
              ? "alert-success"
              : succeed === false
              ? "alert-danger"
              : "alert-info"
          }`}
        >
          {checkingInformation}
        </div>
      ) : null}
    </form>
  );
}
