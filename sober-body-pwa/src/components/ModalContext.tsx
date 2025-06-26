import React, { useState } from 'react'

type ModalType = 'none' | 'settings' | 'twister'

const ModalContext = React.createContext<{
  active: ModalType
  open: (m: ModalType) => void
  close: () => void
}>({ active: 'none', open: () => {}, close: () => {} })

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [active, setActive] = useState<ModalType>('none')
  const open = (m: ModalType) => setActive(m)
  const close = () => setActive('none')
  return (
    <ModalContext.Provider value={{ active, open, close }}>
      {children}
    </ModalContext.Provider>
  )
}

export const useModal = () => React.useContext(ModalContext)
