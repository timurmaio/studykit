import { useCallback, useState } from "react";
import { apiPost, apiSqlSolutionStream } from "../../config";
import { SQL_HINTS } from "../../constants/sqlHints";
import { SqlProblemForm } from "./SqlProblemForm";
import type { LectureContent } from "../../types/Course";

interface SqlProblemSectionProps {
  content: LectureContent;
  onStreamAbortRef: (abort: (() => void) | null) => void;
}

export function SqlProblemSection({ content, onStreamAbortRef }: SqlProblemSectionProps) {
  const [solution, setSolution] = useState("");
  const [alert, setAlert] = useState("");
  const [checkingInformation, setCheckingInformation] = useState("");
  const [succeed, setSucceed] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isHintCopied, setIsHintCopied] = useState(false);

  const sqlHint =
    content.sqlProblemId != null ? SQL_HINTS[content.sqlProblemId] : undefined;

  const copyHint = useCallback(async () => {
    if (!sqlHint) return;
    try {
      await navigator.clipboard.writeText(sqlHint);
      setIsHintCopied(true);
      window.setTimeout(() => setIsHintCopied(false), 1200);
    } catch {
      setIsHintCopied(false);
    }
  }, [sqlHint]);

  const checkTheSolution = (event: React.FormEvent) => {
    event.preventDefault();
    setAlert("");
    setCheckingInformation("");
    setSucceed(null);
    setIsChecking(true);
    onStreamAbortRef(null);

    apiPost<{ id: number }>("/api/sql-solutions", {
      sql_solution: {
        sql_problem_id: content.sqlProblemId || content.id,
        code: solution,
      },
    })
      .then((response) => {
        setCheckingInformation("Идёт проверка...");
        const abort = apiSqlSolutionStream(response.id, (result) => {
          onStreamAbortRef(null);
          setIsChecking(false);
          if (result.timeout) {
            setCheckingInformation("Проверка занимает длительное время, обновите страницу.");
            setSucceed(null);
          } else if (result.succeed === true) {
            setCheckingInformation("Решение верно!");
            setSucceed(true);
          } else if (result.succeed === false) {
            setCheckingInformation("Решение неверно, попробуйте ещё раз!");
            setSucceed(false);
          }
        });
        onStreamAbortRef(abort);
      })
      .catch((err: unknown) => {
        setIsChecking(false);
        const errorText = (err as { errors?: string | string[] })?.errors;
        setAlert(Array.isArray(errorText) ? errorText[0] : String(errorText ?? "Ошибка"));
      });
  };

  return (
    <SqlProblemForm
      solution={solution}
      onSolutionChange={setSolution}
      onCheck={checkTheSolution}
      alert={alert}
      checkingInformation={checkingInformation}
      succeed={succeed}
      isChecking={isChecking}
      hint={
        sqlHint
          ? {
              sqlHint,
              isOpen: isHintOpen,
              isCopied: isHintCopied,
              onToggle: () => setIsHintOpen((p) => !p),
              onCopy: copyHint,
            }
          : undefined
      }
    />
  );
}
