import { Loader } from '@/components/shared/Loader'

export default function TasksLoading() {
  return (
    <div className="bg-[#0e0e0e] text-white h-full w-full flex items-center justify-center p-8">
      <Loader size="lg" label="LOADING TASKS // EXECUTION QUEUE" />
    </div>
  )
}
