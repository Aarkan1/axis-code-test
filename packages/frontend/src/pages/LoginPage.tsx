import { Button, Card, Input, Text } from '@fluentui/react-components'
import { type FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { login, type AuthPayload } from '../api/graphql'
import { AlertIcon, NetworkIcon } from '../components/Icons'

type LoginPageProps = {
    onLogin: (session: AuthPayload) => void
}

export const LoginPage = ({ onLogin }: LoginPageProps) => {
    const navigate = useNavigate()
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsSubmitting(true)
        setErrorMessage(null)

        try {
            const session = await login(username, password)

            onLogin(session)
            navigate('/', { replace: true })
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Login failed.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <main className="login-shell">
            <Card className="login-card">
                <div className="login-brand">
                    <NetworkIcon className="hero-icon" />
                    <div className="hero">
                        <Text as="h1" size={800} weight="semibold">
                            Sign in
                        </Text>
                        <Text className="subtle-text" size={400}>
                            Use your camera dashboard account to continue.
                        </Text>
                    </div>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <label className="form-field">
                        <Text weight="semibold">Username</Text>
                        <Input
                            autoComplete="username"
                            onChange={(_, data) => setUsername(data.value)}
                            required
                            value={username}
                        />
                    </label>

                    <label className="form-field">
                        <Text weight="semibold">Password</Text>
                        <Input
                            autoComplete="current-password"
                            onChange={(_, data) => setPassword(data.value)}
                            required
                            type="password"
                            value={password}
                        />
                    </label>

                    {errorMessage && (
                        <Card className="message-card message-card--error">
                            <AlertIcon className="message-icon" />
                            <Text className="error-text" weight="semibold">
                                {errorMessage}
                            </Text>
                        </Card>
                    )}

                    <Button appearance="primary" disabled={isSubmitting} type="submit">
                        {isSubmitting ? 'Signing in...' : 'Sign in'}
                    </Button>
                </form>
            </Card>
        </main>
    )
}
