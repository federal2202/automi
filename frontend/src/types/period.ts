export interface Period {
  id: string
  userId: string
  title: string
  startDate: string
  endDate: string
  createdAt: string
  updatedAt: string
}

export interface CreatePeriodInput {
  title: string
  startDate: string
  endDate: string
}

// The Periods form always submits the full record on edit, so update accepts
// the same shape as create. If we later need a true partial update, introduce
// a separate `PatchPeriodInput` rather than weakening this one.
export type UpdatePeriodInput = CreatePeriodInput
