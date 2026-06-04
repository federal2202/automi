"use client"

import { useCallback, useState } from 'react'

/**
 * Shared form + delete dialog state machine used by the periods list and
 * detail hooks. Tracks the open/editing/error state for the create-or-edit
 * form and the pending-delete target, plus the open/close + request handlers.
 * It owns no data fetching — callers wire the actual mutations.
 */
export function useCrudDialogs<T>() {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<T | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [pendingDelete, setPendingDelete] = useState<T | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const openCreate = useCallback(() => {
    setEditing(null)
    setFormError(null)
    setIsFormOpen(true)
  }, [])

  const openEdit = useCallback((item: T) => {
    setEditing(item)
    setFormError(null)
    setIsFormOpen(true)
  }, [])

  const requestDelete = useCallback((item: T) => {
    setActionError(null)
    setPendingDelete(item)
  }, [])

  const closeForm = useCallback((open: boolean) => {
    setIsFormOpen(open)
    if (!open) {
      setEditing(null)
      setFormError(null)
    }
  }, [])

  const closeDelete = useCallback((open: boolean) => {
    if (!open) setPendingDelete(null)
  }, [])

  return {
    isFormOpen,
    editing,
    formError,
    pendingDelete,
    actionError,
    setIsFormOpen,
    setEditing,
    setFormError,
    setPendingDelete,
    setActionError,
    openCreate,
    openEdit,
    requestDelete,
    closeForm,
    closeDelete,
  }
}
