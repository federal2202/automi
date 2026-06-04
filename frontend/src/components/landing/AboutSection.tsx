import { ChatDownIcon, CHeckIcon } from "../shared/icons/icons"
import {
    AboutCard,
    CrossIcon,
    CheckMarkIcon,
    realityFeatures,
    solutionFeatures,
} from "./about"

export default function AboutSection() {
    return (
        <div className="w-full flex flex-col items-center py-0 md:py-0 px-4">
            <div className="max-w-7xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">

                {/* Reality Block - Red */}
                <AboutCard
                    variant="red"
                    animationDelay="0.2s"
                    label="THE REALITY"
                    labelClassName="text-[#FFB4AB] text-sm md:text-base font-semibold tracking-wider uppercase"
                    headerIcon={<ChatDownIcon />}
                    heading={<>Unstructured Effort<br />Leads to Burnout.</>}
                    paragraph="Relying on sheer willpower is a failing strategy. Without automation, your habits are just wishes lost in a void of inconsistency."
                    paragraphClassName="mb-8"
                    features={realityFeatures}
                    featureIcon={<CrossIcon />}
                />

                {/* Solution Block - Green */}
                <AboutCard
                    variant="green"
                    animationDelay="0.4s"
                    label="THE SOLUTION"
                    labelClassName="text-green-nice text-sm md:text-base font-semibold tracking-wider uppercase"
                    headerIcon={<CHeckIcon />}
                    heading={<>Quantified Systems<br />Drive Rapid Growth.</>}
                    paragraph="automi turns biological intent into digital architecture. We map your neuro-pathways to a visual interface designed for momentum."
                    paragraphClassName="mb-8 text-[#ffffff]/90"
                    features={solutionFeatures}
                    featureIcon={<CheckMarkIcon />}
                    featureClassName="text-[#ffffff]/90"
                />

            </div>
        </div>
    )
}
