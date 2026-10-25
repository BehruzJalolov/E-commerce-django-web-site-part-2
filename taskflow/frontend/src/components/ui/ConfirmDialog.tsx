import { TriangleAlert } from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  pending?: boolean
  destructive?: boolean
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  pending = false,
  destructive = true,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      size="sm"
      showClose={!pending}
    >
      <div className="flex gap-4">
        <div
          className={
            destructive
              ? 'grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger'
              : 'grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-600'
          }
        >
          <TriangleAlert className="size-5" aria-hidden="true" />
        </div>
        <p className="pt-1 text-sm leading-6 text-muted">{description}</p>
      </div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          variant="secondary"
          onClick={() => onOpenChange(false)}
          disabled={pending}
        >
          {cancelLabel}
        </Button>
        <Button
          variant={destructive ? 'danger' : 'primary'}
          onClick={onConfirm}
          loading={pending}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}
