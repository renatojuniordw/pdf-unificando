"use client"

import { useMemo, useState } from "react"

export type Placement = "footer" | "header"
export type Alignment = "left" | "center" | "right"

export function useNumberingOptions(initial = { placement: "footer" as Placement, alignment: "center" as Alignment, startAt: "1" }) {
  const [placement, setPlacement] = useState<Placement>(initial.placement)
  const [alignment, setAlignment] = useState<Alignment>(initial.alignment)
  const [startAt, setStartAt] = useState(initial.startAt)

  const startAtError = useMemo(() => {
    if (!startAt.trim()) {
      return "Informe o número inicial."
    }

    const parsed = Number(startAt)

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 9999) {
      return "Digite um número inteiro entre 1 e 9999."
    }

    return null
  }, [startAt])

  const canSubmit = !startAtError

  return {
    placement,
    setPlacement,
    alignment,
    setAlignment,
    startAt,
    setStartAt,
    startAtError,
    canSubmit,
    extraData: { placement, alignment, startAt },
  }
}
