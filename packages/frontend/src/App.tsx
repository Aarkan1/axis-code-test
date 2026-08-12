import { Button, Card, Spinner, Text } from '@fluentui/react-components'
import { useEffect, useState } from 'react'

import { fetchCurrentUserCameras, type CamerasResponse } from './api/graphql'

const demoUsers = [
    { id: '0', name: 'Alice' },
    { id: '1', name: 'Bob' }
]

export const App = () => {
    const [selectedUserId, setSelectedUserId] = useState(demoUsers[0].id)
    const [cameraData, setCameraData] = useState<CamerasResponse | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        let isCurrentRequest = true

        const loadCameras = async () => {
            setIsLoading(true)
            setErrorMessage(null)

            try {
                const data = await fetchCurrentUserCameras(selectedUserId)

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
    }, [selectedUserId])

    return (
        <main className="app-shell">
            <section className="hero">
                <Text as="h1" size={800} weight="semibold">
                    Camera Dashboard
                </Text>
                <Text size={400}>
                    Select a demo user to load only the cameras that the backend allows that user to see.
                </Text>
            </section>

            <section className="user-picker" aria-label="Select logged in user">
                {demoUsers.map((user) => (
                    <Button
                        appearance={user.id === selectedUserId ? 'primary' : 'secondary'}
                        key={user.id}
                        onClick={() => setSelectedUserId(user.id)}
                    >
                        {user.name}
                    </Button>
                ))}
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
