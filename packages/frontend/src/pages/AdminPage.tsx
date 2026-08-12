import { Button, Card, Spinner, Text } from '@fluentui/react-components'
import { type FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
    addCamera,
    addCameraToUser,
    fetchAdminData,
    removeCameraFromUser,
    type AdminDataResponse
} from '../api/graphql'
import type { StoredSession } from '../auth'
import { AdminActions, AdminUsers } from '../components/AdminPanelSections'

type AdminPageProps = {
    session: StoredSession
    onLogout: () => void
}

export const AdminPage = ({ session, onLogout }: AdminPageProps) => {
    const navigate = useNavigate()
    const [adminData, setAdminData] = useState<AdminDataResponse | null>(null)
    const [createUserId, setCreateUserId] = useState('')
    const [existingUserId, setExistingUserId] = useState('')
    const [existingCameraId, setExistingCameraId] = useState('')
    const [name, setName] = useState('')
    const [niceName, setNiceName] = useState('')
    const [address, setAddress] = useState('')
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)

    const loadAdminData = async () => {
        setIsLoading(true)
        setErrorMessage(null)

        try {
            const data = await fetchAdminData(session.token)
            const firstUserId = data.users[0]?.id ?? ''
            const firstCameraId = data.allCameras[0]?.id ?? ''

            setAdminData(data)
            setCreateUserId((currentUserId) => currentUserId || firstUserId)
            setExistingUserId((currentUserId) => currentUserId || firstUserId)
            setExistingCameraId((currentCameraId) => currentCameraId || firstCameraId)
        } catch (error) {
            setAdminData(null)
            setErrorMessage(error instanceof Error ? error.message : 'Could not load admin data.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        void loadAdminData()
    }, [session.token])

    const runAdminAction = async (action: () => Promise<unknown>, message: string) => {
        setIsSaving(true)
        setErrorMessage(null)
        setSuccessMessage(null)

        try {
            await action()
            setSuccessMessage(message)
            await loadAdminData()
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Admin action failed.')
        } finally {
            setIsSaving(false)
        }
    }

    const handleLogout = () => {
        onLogout()
        navigate('/login', { replace: true })
    }

    const handleCreateCamera = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        void runAdminAction(
            () => addCamera(session.token, { userId: createUserId, name, niceName: niceName || null, address }),
            'Camera created.'
        )

        setName('')
        setNiceName('')
        setAddress('')
    }

    const handleAddExistingCamera = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        void runAdminAction(
            () => addCameraToUser(session.token, existingUserId, existingCameraId),
            'Camera assigned to user.'
        )
    }

    const handleRemoveCamera = (userId: string, cameraId: string) => {
        void runAdminAction(() => removeCameraFromUser(session.token, userId, cameraId), 'Camera removed from user.')
    }

    return (
        <main className="app-shell">
            <section className="dashboard-header">
                <div className="hero">
                    <Text as="h1" size={800} weight="semibold">
                        Admin Panel
                    </Text>
                    <Text size={400}>Manage users and their camera assignments.</Text>
                </div>

                <div className="header-actions">
                    <Button onClick={() => navigate('/')}>Home</Button>
                    <Button onClick={handleLogout}>Log out</Button>
                </div>
            </section>

            {isLoading && (
                <div className="state-message">
                    <Spinner label="Loading admin data" />
                </div>
            )}

            {!isLoading && errorMessage && (
                <Card className="state-card error-card">
                    <Text className="error-text" weight="semibold">
                        {errorMessage}
                    </Text>
                </Card>
            )}

            {!isLoading && successMessage && (
                <Card className="state-card">
                    <Text weight="semibold">{successMessage}</Text>
                </Card>
            )}

            {!isLoading && adminData && (
                <>
                    <AdminActions
                        address={address}
                        adminData={adminData}
                        createUserId={createUserId}
                        existingCameraId={existingCameraId}
                        existingUserId={existingUserId}
                        isSaving={isSaving}
                        name={name}
                        niceName={niceName}
                        onAddExistingCamera={handleAddExistingCamera}
                        onCreateCamera={handleCreateCamera}
                        onSetAddress={setAddress}
                        onSetCreateUserId={setCreateUserId}
                        onSetExistingCameraId={setExistingCameraId}
                        onSetExistingUserId={setExistingUserId}
                        onSetName={setName}
                        onSetNiceName={setNiceName}
                    />
                    <AdminUsers adminData={adminData} isSaving={isSaving} onRemoveCamera={handleRemoveCamera} />
                </>
            )}
        </main>
    )
}
