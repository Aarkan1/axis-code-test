import { Button, Text } from '@fluentui/react-components'
import { useEffect, useState, type KeyboardEvent } from 'react'

export type AdminSelectOption = {
    label: string
    value: string
}

type AdminSelectProps = {
    label: string
    onChange: (value: string) => void
    options: AdminSelectOption[]
    value: string
}

export const AdminSelect = ({ label, onChange, options, value }: AdminSelectProps) => {
    const selectedIndex = Math.max(
        options.findIndex((option) => option.value === value),
        0
    )
    const [activeIndex, setActiveIndex] = useState(selectedIndex)
    const [isOpen, setIsOpen] = useState(false)
    const selectedOption = options[selectedIndex]

    useEffect(() => {
        setActiveIndex(selectedIndex)
    }, [selectedIndex])

    const selectOption = (option: AdminSelectOption) => {
        onChange(option.value)
        setIsOpen(false)
    }

    const moveActiveIndex = (step: number) => {
        setIsOpen(true)
        setActiveIndex((currentIndex) => Math.min(Math.max(currentIndex + step, 0), options.length - 1))
    }

    const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowDown') {
            event.preventDefault()
            moveActiveIndex(1)
        }

        if (event.key === 'ArrowUp') {
            event.preventDefault()
            moveActiveIndex(-1)
        }

        if (event.key === 'Enter' && isOpen) {
            event.preventDefault()
            selectOption(options[activeIndex])
        }

        if (event.key === 'Escape') {
            setIsOpen(false)
        }
    }

    return (
        <label className="form-field">
            <Text weight="semibold">{label}</Text>
            <div
                className="admin-select"
                onBlur={(event) => {
                    if (!event.currentTarget.contains(event.relatedTarget)) {
                        setIsOpen(false)
                    }
                }}
                onKeyDown={handleKeyDown}
            >
                <Button className="admin-select-trigger" onClick={() => setIsOpen((current) => !current)} type="button">
                    {selectedOption?.label ?? 'Select'}
                </Button>
                {isOpen && (
                    <div className="admin-select-options" role="listbox">
                        {options.map((option, index) => (
                            <button
                                aria-selected={option.value === value}
                                className={`admin-select-option ${index === activeIndex ? 'is-active' : ''}`}
                                key={option.value}
                                onClick={() => selectOption(option)}
                                onMouseEnter={() => setActiveIndex(index)}
                                role="option"
                                type="button"
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </label>
    )
}
