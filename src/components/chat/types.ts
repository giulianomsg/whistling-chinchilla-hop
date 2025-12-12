export interface ChatMessage {
    id: string
    sender_id: string
    receiver_id: string
    content: string
    message_type: 'text' | 'image' | 'file' | 'call_invite'
    file_url: string | null
    is_read: boolean
    read_at: string | null
    created_at: string
    updated_at: string
}

export interface Contact {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
    role: string
    last_message?: string
    last_message_time?: string
    unread_count?: number
    is_client?: boolean
}
