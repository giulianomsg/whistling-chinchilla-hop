import React, { useState, useEffect, useRef } from 'react'
import {
    Send, Phone, Video, ArrowLeft, Loader2, MessageCircle,
    Check, CheckCheck, Paperclip
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'
import { format, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { showSuccess, showError } from '@/utils/toast'
import { ChatMessage, Contact } from './types'
import MessageBubble from './MessageBubble'

interface ChatAreaProps {
    contact: Contact | null
    messages: ChatMessage[]
    loading: boolean
    onSend: (content: string, type?: 'text' | 'image' | 'file' | 'call_invite', fileUrl?: string) => Promise<void>
    onBack: () => void
    isMobile: boolean
    online: boolean
    user: any
    onInputFocus?: () => void
}

const formatChatTimestamp = (dateString: string) => {
    if (!dateString) return ''
    try {
        const date = new Date(dateString)
        if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR })
        return format(date, 'dd/MM HH:mm', { locale: ptBR })
    } catch { return '' }
}

const getInitials = (fullName: string | null, email: string) => {
    if (fullName && fullName.trim()) return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return email?.[0]?.toUpperCase() || 'U'
}

const ChatArea: React.FC<ChatAreaProps> = ({ contact, messages, loading, onSend, onBack, isMobile, online, user, onInputFocus }) => {

    const [inputText, setInputText] = useState('')
    const [sending, setSending] = useState(false)
    const [uploading, setUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Função de Scroll Inteligente
    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior })
        }
    }

    // Scroll ao carregar mensagens ou enviar
    useEffect(() => {
        // Pequeno timeout para garantir renderização do DOM
        const timer = setTimeout(() => scrollToBottom(loading ? 'auto' : 'smooth'), 100)
        return () => clearTimeout(timer)
    }, [messages, loading])

    const handleSendMessage = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!inputText.trim() && !sending) return
        setSending(true)
        await onSend(inputText, 'text')
        setInputText('')
        setSending(false)
        // Scroll forçado após envio
        setTimeout(() => scrollToBottom(), 100)
    }

    const handleCall = async (video: boolean) => {
        if (!contact || !user) return
        const roomName = `capifit-${[user.id, contact.id].sort().join('-')}`
        const callUrl = `https://meet.jit.si/${roomName}`
        await onSend(video ? 'Iniciou uma chamada de vídeo.' : 'Iniciou uma chamada de voz.', 'call_invite', callUrl)
        window.open(callUrl, '_blank')
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !user) return

        try {
            setUploading(true)
            const fileExt = file.name.split('.').pop()
            const fileName = `${crypto.randomUUID()}.${fileExt}`
            const filePath = `${user.id}/${fileName}`

            const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(filePath, file)
            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(filePath)

            const isImage = file.type.startsWith('image/')
            const type = isImage ? 'image' : 'file'
            const finalUrl = isImage ? `${publicUrl}?t=${Date.now()}` : publicUrl
            const content = isImage ? 'Imagem' : file.name

            await onSend(content, type, finalUrl)
            showSuccess('Enviado!')

        } catch (error: any) { showError('Erro no envio: ' + error.message) }
        finally {
            setUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    if (!contact) return <div className="flex-1 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm"><div className="text-center p-8"><div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-6 border border-border shadow-2xl shadow-primary/10"><MessageCircle className="h-12 w-12 text-primary" /></div><h3 className="text-2xl font-bold text-foreground mb-2">Chat CapiFit</h3><p className="text-muted-foreground">Selecione uma conversa para começar.</p></div></div>

    return (
        <div className="flex-1 flex flex-col h-full bg-background relative">
            <div className="p-4 border-b border-border bg-card/80 backdrop-blur-md flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    {isMobile && <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5 text-muted-foreground" /></Button>}
                    <Avatar className="border border-border"><AvatarImage src={contact.avatar_url || ''} /><AvatarFallback className="bg-muted text-primary font-bold">{getInitials(contact.full_name, contact.email)}</AvatarFallback></Avatar>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-foreground">{contact.full_name || contact.email}</h3>
                            {contact.role === 'admin' && <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">Administrador</Badge>}
                            {contact.role === 'professional' && <Badge variant="secondary" className="h-5 px-1.5 text-[10px] bg-blue-500/10 text-blue-500 border-blue-500/20">Profissional</Badge>}
                            {contact.role === 'client' && <Badge variant="outline" className="h-5 px-1.5 text-[10px] text-muted-foreground">Aluno</Badge>}
                        </div>
                        <div className="flex items-center gap-1.5"><span className={`w-1.5 h-1.5 rounded-full ${online ? 'bg-green-500 shadow-[0_0_5px_#22c55e]' : 'bg-gray-500'}`} /><p className="text-xs text-muted-foreground">{online ? 'Online' : 'Offline'}</p></div>
                    </div>
                </div>
                <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => handleCall(false)} className="text-muted-foreground hover:text-primary hover:bg-accent"><Phone className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleCall(true)} className="text-muted-foreground hover:text-primary hover:bg-accent"><Video className="h-5 w-5" /></Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {loading ? <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : messages.length === 0 ? <div className="text-center py-12"><p className="text-muted-foreground bg-muted inline-block px-4 py-2 rounded-full text-sm">Inicie a conversa 👋</p></div> : messages.map((msg) => {
                    const isOwn = msg.sender_id === user?.id
                    return (
                        <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] md:max-w-[65%] rounded-2xl px-4 py-3 shadow-lg ${isOwn ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-muted text-foreground rounded-bl-none'}`}>
                                <MessageBubble msg={msg} isOwn={isOwn} onImageLoad={() => scrollToBottom()} />
                                <div className={`flex items-center justify-end gap-1 mt-1 ${isOwn ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                    <span className="text-[10px]">{formatChatTimestamp(msg.created_at)}</span>
                                    {/* Ícone de Visualizado - Atualizado em Tempo Real */}
                                    {isOwn && (msg.is_read ? <CheckCheck className="h-3 w-3 text-current" /> : <Check className="h-3 w-3" />)}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-border bg-card/90 backdrop-blur-lg">
                <form onSubmit={handleSendMessage} className="flex gap-3 items-end">
                    <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
                    <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                        {uploading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Paperclip className="h-5 w-5" />}
                    </Button>
                    <Input placeholder="Digite sua mensagem..." value={inputText} onChange={e => setInputText(e.target.value)} onFocus={onInputFocus} className="flex-1 bg-muted border-border text-foreground focus-visible:ring-primary/50" disabled={sending || uploading} />
                    <Button type="submit" disabled={!inputText.trim() || sending} size="icon" className="bg-primary hover:bg-primary/80 text-primary-foreground rounded-xl w-11 h-11 shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all hover:scale-105">
                        {sending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </Button>
                </form>
            </div>
        </div>
    )
}

export default ChatArea
