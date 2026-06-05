import { Loader } from '@/components/shared/Loader'

export default function PeriodsLoading() {
  return (
    <div className="bg-bg-surface text-white h-full w-full flex items-center justify-center p-8">
      <Loader size="lg" label="LOADING PERIODS" />
    </div>
  )
}
