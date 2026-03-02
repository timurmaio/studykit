interface SqlProblemFormProps {
  solution: string;
  onSolutionChange: (value: string) => void;
  onCheck: (e: React.FormEvent) => void;
  alert: string;
  checkingInformation: string;
  succeed: boolean | null;
  sqlHint?: string;
  isHintOpen: boolean;
  onHintToggle: () => void;
  isHintCopied: boolean;
  onCopyHint: () => void;
}

export function SqlProblemForm({
  solution,
  onSolutionChange,
  onCheck,
  alert,
  checkingInformation,
  succeed,
  sqlHint,
  isHintOpen,
  onHintToggle,
  isHintCopied,
  onCopyHint,
}: SqlProblemFormProps) {
  return (
    <form className="show-sql-form" onSubmit={onCheck}>
      <label htmlFor="solutionTextarea" className="show-sql-label">
        Введите сюда свое решение
      </label>
      {sqlHint ? (
        <div className="show-sql-hint-wrap">
          <button
            type="button"
            className="show-sql-hint-toggle"
            onClick={onHintToggle}
          >
            {isHintOpen ? "Скрыть подсказку" : "Показать подсказку"}
          </button>
          {isHintOpen ? (
            <div className="show-sql-hint-popover">
              <div className="show-sql-hint-header">
                <span>Правильный SQL</span>
                <button
                  type="button"
                  className="show-sql-copy"
                  onClick={onCopyHint}
                >
                  {isHintCopied ? "Скопировано" : "Скопировать"}
                </button>
              </div>
              <pre className="show-sql-hint-code">{sqlHint}</pre>
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
      <button type="submit" className="button mb-4 show-sql-button">
        Отправить решение
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
