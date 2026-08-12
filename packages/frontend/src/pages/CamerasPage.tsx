import { Button, Card, Image, Spinner, Text, Tooltip } from '@fluentui/react-components'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { fetchCurrentUserCameras, type CamerasResponse } from '../api/graphql'
import { AlertIcon, CameraIcon, InfoIcon } from '../components/Icons'
import type { StoredSession } from '../auth'

const cameraDeviceImageUrl =
    'https://www.axis.com/sites/axis/files/styles/standard_1360_x_auto/public/2023-05/m4218_lv_wall_angle_left_2301-Productimageswithcropping.png.webp?itok=jVaylaKQ'

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
        <main className="app-shell products-page">
            <section className="dashboard-header">
                <div className="hero">
                    <div className="hero-title">
                        <CameraIcon className="hero-icon" />
                        <Text as="h1" size={800} weight="semibold">
                            Network cameras
                        </Text>
                    </div>
                    <Text className="subtle-text" size={400}>
                        Signed in as {session.user.name}.
                    </Text>
                </div>

                <div className="header-actions">
                    {session.user.isAdmin && <Button onClick={() => navigate('/admin')}>Admin</Button>}
                    <Button onClick={handleLogout}>Log out</Button>
                </div>
            </section>

            {isLoading && (
                <div className="state-message">
                    <Spinner label="Loading cameras" />
                </div>
            )}

            {!isLoading && errorMessage && (
                <Card className="message-card message-card--error">
                    <AlertIcon className="message-icon" />
                    <div className="hero">
                        <Text weight="semibold">Could not load cameras</Text>
                        <Text>{errorMessage}</Text>
                    </div>
                </Card>
            )}

            {!isLoading && cameraData && (
                <section className="camera-section">
                    <Text as="h2" className="products-section-title" size={500} weight="semibold">
                        Cameras for {cameraData.me.name}
                    </Text>

                    {cameraData.cameras.length === 0 ? (
                        <Card className="message-card message-card--info">
                            <InfoIcon className="message-icon" />
                            <Text>This user does not have any cameras yet.</Text>
                        </Card>
                    ) : (
                        <>
                            <Text className="subtle-text" size={400}>
                                Your assigned Axis camera devices.
                            </Text>
                            <div className="camera-grid">
                                {cameraData.cameras.map((camera) => (
                                    <Card className="camera-card product-card" key={camera.id}>
                                        <Image alt="" className="product-image" src={cameraDeviceImageUrl} />
                                        <Text className="product-name" size={500} weight="semibold">
                                            {camera.niceName ?? camera.name}
                                        </Text>
                                        {camera.niceName && (
                                            <Tooltip content="Device name" positioning="above" relationship="label">
                                                <Text className="product-detail">{camera.name}</Text>
                                            </Tooltip>
                                        )}
                                        <Tooltip content="Device address" positioning="above" relationship="label">
                                            <Text className="camera-address">{camera.address}</Text>
                                        </Tooltip>
                                    </Card>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            )}
        </main>
    )
}
