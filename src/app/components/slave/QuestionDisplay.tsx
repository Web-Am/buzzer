import { Round } from "@/app/types";

interface Props {
    round: Round | null;
}

export function QuestionDisplay({ round }: Props) {
    if (!round) {
        return (
            <p className="text-center text-sm text-gray-500">
                In attesa che il Master avvii un nuovo round...
            </p>
        );
    }

    return (
        <div className="text-center space-y-1">
            <p className="text-xs uppercase tracking-wide text-gray-400">
                Domanda in gioco
            </p>
            <p className="text-lg font-semibold">{round.questionText}</p>
        </div>
    );
}
