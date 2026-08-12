import { FluentProvider, webLightTheme } from '@fluentui/react-components'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import './styles.css'

const rootElement = document.getElementById('root')

if (!rootElement) {
    throw new Error('Could not find the root element.')
}

createRoot(rootElement).render(
    <StrictMode>
        <FluentProvider theme={webLightTheme}>
            <BrowserRouter>
                <App />
            </BrowserRouter>
        </FluentProvider>
    </StrictMode>
)
