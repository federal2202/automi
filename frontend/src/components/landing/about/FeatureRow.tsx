import { ReactNode } from "react"
import SecondaryText from "../../shared/SecondaryText"

interface FeatureRowProps {
    text: string
    icon: ReactNode
    className?: string
}

export default function FeatureRow({ text, icon, className }: FeatureRowProps) {
    return (
        <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
                {icon}
            </div>
            <SecondaryText text={text} className={className} />
        </div>
    )
}
