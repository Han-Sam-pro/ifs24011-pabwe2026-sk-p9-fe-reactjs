import { useCallback, useState } from 'react'

// Custom hook state input form. onChange menerima event maupun nilai langsung.
export default function useInput(initialValue = '') {
  const [value, setValue] = useState(initialValue)
  const onChange = useCallback((eventOrValue) => {
    setValue(eventOrValue?.target ? eventOrValue.target.value : eventOrValue)
  }, [])
  return [value, onChange, setValue]
}
