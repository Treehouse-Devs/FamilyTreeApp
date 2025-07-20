import React, { createContext, useContext, useState, ReactNode } from 'react'
import { Modal, ModalBackdrop, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@/components/ui/modal'
import { Text } from '@/components/ui/text'
import { Button, ButtonText } from '@/components/ui/button'

interface AlertContextProps {
  showAlert: (title: string, message: string) => void
}

const AlertContext = createContext<AlertContextProps | undefined>(undefined)

export const CustomAlertProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [cancelable, setCancelable] = useState(true)

  const showAlert = (alertTitle: string, alertMessage: string, cancelable?: boolean) => {
    setTitle(alertTitle)
    setMessage(alertMessage)
    setIsVisible(true)
    setCancelable(cancelable ?? true)
  }

  const hideAlert = () => {
    setIsVisible(false)
  }

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}

      <Modal isOpen={isVisible} onClose={hideAlert}>
        <ModalBackdrop cancelable={cancelable} />
        <ModalContent>
          <ModalHeader>
            <Text size="lg" className="font-bold">{title}</Text>
          </ModalHeader>
          <ModalBody>
            <Text className="font-sans">{message}</Text>
          </ModalBody>
          <ModalFooter>
            <Button onPress={hideAlert}>
              <ButtonText>OK</ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </AlertContext.Provider>
  )
}

export const useAlert = () => {
  const context = useContext(AlertContext)
  if (!context) throw new Error('useAlert must be used within CustomAlertProvider')
  return context.showAlert
}
