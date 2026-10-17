import { useEffect, useRef, useState, type KeyboardEvent } from 'react'

// Open state of a picker's popover: closes on a click outside and on Escape. Escape
// stops there, so it doesn't also close the modal around the picker.
export function usePopover<T extends HTMLElement = HTMLDivElement>() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<T>(null)

  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      e.stopPropagation()
      e.nativeEvent.stopImmediatePropagation()
      setIsOpen(false)
    }
  }

  return { isOpen, setIsOpen, containerRef, onKeyDown }
}
