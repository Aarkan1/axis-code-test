import { Button, Card, Spinner, Text } from '@fluentui/react-components'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchCurrentUserCameras, type CamerasResponse } from '../api/graphql'
import type { StoredSession } from '../auth'

type CamerasPageProps = {
    session: StoredSession
    onLogout: () => void
}

export const CamerasPage = ({ session, onLogout }: CamerasPageProps) => {
    const navigate = useNavigate()
    const [cameraData, setCameraData] = useState<CamerasResponse | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    const handleLogout = () => {
        onLogout()
        navigate('/login', { replace: true })
    }

    useEffect(() => {
        let isCurrentRequest = true

        const loadCameras = async () => {
            setIsLoading(true)
            setErrorMessage(null)

            try {
                const data = await fetchCurrentUserCameras(session.token)

                if (isCurrentRequest) {
                    setCameraData(data)
                }
            } catch (error) {
                if (isCurrentRequest) {
                    setCameraData(null)
                    setErrorMessage(error instanceof Error ? error.message : 'Could not load cameras.')
                }
            } finally {
                if (isCurrentRequest) {
                    setIsLoading(false)
                }
            }
        }

        void loadCameras()

        return () => {
            isCurrentRequest = false
        }
    }, [session.token])

    return (
        <main className="app-shell">
            <section className="dashboard-header">
                <div className="hero">
                    <Text as="h1" size={800} weight="semibold">
                        Camera Dashboard
                    </Text>
                    <Text size={400}>Signed in as {session.user.name}.</Text>
                </div>

                <Button onClick={handleLogout}>Log out</Button>
            </section>

            {isLoading && (
                <div className="state-message">
                    <Spinner label="Loading cameras" />
                </div>
            )}

            {!isLoading && errorMessage && (
                <Card className="state-card">
                    <Text weight="semibold">Could not load cameras</Text>
                    <Text>{errorMessage}</Text>
                </Card>
            )}

            {!isLoading && cameraData && (
                <section className="camera-section">
                    <Text as="h2" size={600} weight="semibold">
                        Cameras for {cameraData.me.name}
                    </Text>

                    {cameraData.cameras.length === 0 ? (
                        <Card className="state-card">
                            <Text>This user does not have any cameras yet.</Text>
                        </Card>
                    ) : (
                        <div className="camera-grid">
                            {cameraData.cameras.map((camera) => (
                                <Card className="camera-card" key={camera.id}>
                                    <Text size={500} weight="semibold">
                                        {camera.niceName ?? camera.name}
                                    </Text>
                                    {camera.niceName && <Text>{camera.name}</Text>}
                                    <Text className="camera-address">{camera.address}</Text>
                                </Card>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </main>
    )
}
