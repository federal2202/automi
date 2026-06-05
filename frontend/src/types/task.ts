export interface Step {
  stepNumber: number
  title: string
  instruction: string
}

export interface Resource {
  title: string
  type: 'video' | 'article' | 'exercise' | 'tool'
  url: string
}

export interface Task {
  id: string
  eventId: string
  userId: string
  title: string
  description: string
  estimatedTimeMinutes: number
  difficulty: 'easy' | 'medium' | 'hard'
  steps: Step[]
  resources?: Resource[]
  successCriteria: string
  isDone: boolean
  aiStatus: 'pending' | 'done' | 'failed'
  createdAt: string
  updatedAt: string
}
