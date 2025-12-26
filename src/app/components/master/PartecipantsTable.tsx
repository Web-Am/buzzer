import { Room } from "@/app/types";

interface Props {
    room: Room;
}

export function ParticipantsTable({ room }: Props) {
    const participants = Object.entries(room.participants ?? {});

    return (
        <div>
            <h3 className="text-lg font-semibold mb-2">Partecipanti</h3>
            <div className="overflow-x-auto rounded-xl border">
                <table className="min-w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left">Nome</th>
                            <th className="px-3 py-2 text-right">Round vinti</th>
                            <th className="px-3 py-2 text-right">Punti usati</th>
                            <th className="px-3 py-2 text-right">Punti disponibili</th>
                            <th className="px-3 py-2 text-right">Connesso</th>
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map(([key, p]) => {
                            const used = p.pointsUsed ?? 0;
                            const avail = p.pointsTotal - used;
                            const isOnline = p.isOnline;
                            return (
                                <tr key={key} className="border-t">
                                    <td className="px-3 py-2">{p.name}</td>
                                    <td className="px-3 py-2 text-right">
                                        {p.roundsWon?.length ?? 0}
                                    </td>
                                    <td className="px-3 py-2 text-right">{used}</td>
                                    <td className="px-3 py-2 text-right">{avail}</td>
                                    <td className="px-3 py-2 text-right">
                                        <span className={`mr-3 inline-block h-2 w-2 rounded-full 
                                            ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                    </td>
                                </tr>
                            );
                        })}
                        {participants.length === 0 && (
                            <tr>
                                <td
                                    className="px-3 py-4 text-center text-gray-500"
                                    colSpan={4} >
                                    Ancora nessun partecipante.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
