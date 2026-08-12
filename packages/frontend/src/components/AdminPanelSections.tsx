import { Button, Card, Input, Text } from '@fluentui/react-components'
import type { FormEvent } from 'react'

import type { AdminDataResponse } from '../api/graphql'
import { AdminSelect } from './AdminSelect'
import { CameraIcon, NetworkIcon, ShieldIcon } from './Icons'

type AdminActionsProps = {
    adminData: AdminDataResponse
    createUserId: string
    existingCameraId: string
    existingUserId: string
    name: string
    niceName: string
    address: string
    isSaving: boolean
    onAddExistingCamera: (event: FormEvent<HTMLFormElement>) => void
    onCreateCamera: (event: FormEvent<HTMLFormElement>) => void
    onSetAddress: (value: string) => void
    onSetCreateUserId: (value: string) => void
    onSetExistingCameraId: (value: string) => void
    onSetExistingUserId: (value: string) => void
    onSetName: (value: string) => void
    onSetNiceName: (value: string) => void
}

type AdminUsersProps = {
    adminData: AdminDataResponse
    isSaving: boolean
    onRemoveCamera: (userId: string, cameraId: string, cameraLabel: string, userName: string) => void
}

export const AdminActions = ({
    adminData,
    createUserId,
    existingCameraId,
    existingUserId,
    name,
    niceName,
    address,
    isSaving,
    onAddExistingCamera,
    onCreateCamera,
    onSetAddress,
    onSetCreateUserId,
    onSetExistingCameraId,
    onSetExistingUserId,
    onSetName,
    onSetNiceName
}: AdminActionsProps) => (
    <section className="admin-actions">
        <Card className="admin-card">
            <div className="camera-card-header">
                <CameraIcon className="card-icon" />
                <Text as="h2" size={500} weight="semibold">
                    Create camera
                </Text>
            </div>
            <form className="admin-form" onSubmit={onCreateCamera}>
                <UserSelect label="User" onChange={onSetCreateUserId} users={adminData.users} value={createUserId} />
                <label className="form-field">
                    <Text weight="semibold">Camera name</Text>
                    <Input onChange={(_, data) => onSetName(data.value)} required value={name} />
                </label>
                <label className="form-field">
                    <Text weight="semibold">Nice name</Text>
                    <Input onChange={(_, data) => onSetNiceName(data.value)} value={niceName} />
                </label>
                <label className="form-field">
                    <Text weight="semibold">Address</Text>
                    <Input onChange={(_, data) => onSetAddress(data.value)} required value={address} />
                </label>
                <Button appearance="primary" disabled={isSaving} type="submit">
                    Create camera
                </Button>
            </form>
        </Card>

        <Card className="admin-card">
            <div className="camera-card-header">
                <NetworkIcon className="card-icon" />
                <Text as="h2" size={500} weight="semibold">
                    Assign camera
                </Text>
            </div>
            <form className="admin-form" onSubmit={onAddExistingCamera}>
                <UserSelect label="User" onChange={onSetExistingUserId} users={adminData.users} value={existingUserId} />
                <AdminSelect
                    label="Camera"
                    onChange={onSetExistingCameraId}
                    options={adminData.allCameras.map((camera) => ({
                        label: camera.niceName ?? camera.name,
                        value: camera.id
                    }))}
                    value={existingCameraId}
                />
                <Button appearance="primary" disabled={isSaving} type="submit">
                    Assign to user
                </Button>
            </form>
        </Card>
    </section>
)

export const AdminUsers = ({ adminData, isSaving, onRemoveCamera }: AdminUsersProps) => (
    <section className="admin-users">
        {adminData.users.map((user) => (
            <Card className="admin-card" key={user.id}>
                <div className="camera-card-header">
                    <ShieldIcon className="card-icon" />
                    <Text as="h2" size={500} weight="semibold">
                        {user.name}
                    </Text>
                </div>
                {user.cameras.length === 0 ? (
                    <Text>No cameras assigned.</Text>
                ) : (
                    <div className="admin-camera-list">
                        {user.cameras.map((camera) => (
                            <div className="admin-camera-row" key={camera.id}>
                                <Text>{camera.niceName ?? camera.name}</Text>
                                <Button
                                    disabled={isSaving}
                                    onClick={() =>
                                        onRemoveCamera(user.id, camera.id, camera.niceName ?? camera.name, user.name)
                                    }
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        ))}
    </section>
)

const UserSelect = ({
    label,
    onChange,
    users,
    value
}: {
    label: string
    onChange: (value: string) => void
    users: AdminDataResponse['users']
    value: string
}) => (
    <AdminSelect
        label={label}
        onChange={onChange}
        options={users.map((user) => ({ label: user.name, value: user.id }))}
        value={value}
    />
)
