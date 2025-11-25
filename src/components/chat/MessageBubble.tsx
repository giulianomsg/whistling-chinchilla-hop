import React from 'react'
import { FileText, Download, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ChatMessage } from './types'

interface MessageBubbleProps {
    msg: ChatMessage
    isOwn: boolean
    onImageLoad: () => void
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg, isOwn, onImageLoad }) => {
    if (msg.message_type === 'image' && msg.file_url) {
        return (
            <div className="space-y-2">
                <img
                    src={msg.file_url}
                    alt="Anexo"
                    className="max-w-full rounded-lg border border-border max-h-[300px] object-cover cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(msg.file_url!, '_blank')}
                    onLoad={onImageLoad}
                    loading="lazy"
                />
            </div>
        )
    }

    if (msg.message_type === 'file' && msg.file_url) {
        return (
            <a href={msg.file_url} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${isOwn ? 'bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20' : 'bg-muted border-border hover:bg-accent'}`}>
                <div className="p-2 bg-background/50 rounded-full"><FileText className="h-5 w-5" /></div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate max-w-[150px]">{msg.content}</p><p className="text-[10px] opacity-70">Clique para baixar</p></div>
                <Download className="h-4 w-4 opacity-70" />
            </a>
        )
    }

    if (msg.message_type === 'call_invite' && msg.file_url) {
        return (
            <div className="flex flex-col gap-2">
                <p className="font-medium">{msg.content}</p>
                <Button size="sm" className={`${isOwn ? 'bg-background text-foreground hover:bg-background/90' : 'bg-green-500 text-white hover:bg-green-600'} w-full`} onClick={() => window.open(msg.file_url!, '_blank')}>
                    <Video className="mr-2 h-4 w-4" /> Entrar na Sala
                </Button>
            </div>
        )
    }

    return <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">{msg.content}</p>
}

export default MessageBubble
