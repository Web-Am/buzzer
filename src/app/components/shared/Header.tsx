import { Zap } from "lucide-react";
import Link from "next/link";
export default function Header() {
    return <div className="sticky top-0 z-50 border-b border-gray-200/50 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <Link href="/">
                    <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-gradient-to-br from-primary-600 to-secondary-600 p-2">
                            <Zap size={24} className="text-white" />
                        </div>
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                            Fanta Buzzer
                        </h1>
                    </div>
                </Link>
            </div>
        </div>
    </div>
}