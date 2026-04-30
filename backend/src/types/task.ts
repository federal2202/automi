export interface Step {
  stepNumber: number;
  title: string;
  instruction: string;
}

export interface Resource {
  title: string;
  type: string;
  url: string;
}

export interface GeneratedTaskData {
  title: string;
  description: string;
  estimatedTimeMinutes: number;
  difficulty: "easy" | "medium" | "hard";
  steps: Step[];
  resources?: Resource[];
  successCriteria: string;
}
