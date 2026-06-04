import { ReactNode } from "react"
import SecondaryText from "../../shared/SecondaryText"
import CardWrapper from "../../shared/CardWrapper"
import FeatureRow from "./FeatureRow"

interface AboutCardProps {
    variant: "red" | "green"
    animationDelay: string
    label: string
    labelClassName: string
    headerIcon: ReactNode
    heading: ReactNode
    paragraph: string
    paragraphClassName?: string
    features: string[]
    featureIcon: ReactNode
    featureClassName?: string
}

export default function AboutCard({
    variant,
    animationDelay,
    label,
    labelClassName,
    headerIcon,
    heading,
    paragraph,
    paragraphClassName,
    features,
    featureIcon,
    featureClassName,
}: AboutCardProps) {
    return (
        <CardWrapper variant={variant} animationDelay={animationDelay}>
            <div className="flex justify-between items-start mb-4">
                <span className={labelClassName}>{label}</span>
                <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                    {headerIcon}
                </div>
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight">
                {heading}
            </h2>

            <div className="mb-8">
                <SecondaryText
                    text={paragraph}
                    size="small"
                    className={paragraphClassName}
                />
            </div>

            <div className="space-y-4">
                {features.map((text) => (
                    <FeatureRow
                        key={text}
                        text={text}
                        icon={featureIcon}
                        className={featureClassName}
                    />
                ))}
            </div>
        </CardWrapper>
    )
}
