import React from 'react'
import { MoreVertical, Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { format, isToday, isYesterday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Contact } from './types'

interface ContactsListProps {
    contacts: Contact[]
    loading: boolean
    selectedContact: Contact | null
    onSelect: (c: Contact) => void
    searchTerm: string
    onSearch: (v: string) => void
    onlineUsers: Set<string>
}

const formatSidebarDate = (dateString?: string) => {
    if (!dateString) return ''
    try {
        const date = new Date(dateString)
        if (isToday(date)) return format(date, 'HH:mm', { locale: ptBR })
        if (isYesterday(date)) return 'Ontem'
        return format(date, 'dd/MM', { locale: ptBR })
    } catch { return '' }
}

const getInitials = (fullName: string | null, email: string) => {
    if (fullName && fullName.trim()) return fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    return email?.[0]?.toUpperCase() || 'U'
}

const ContactsList: React.FC<ContactsListProps> = ({ contacts, loading, selectedContact, onSelect, searchTerm, onSearch, onlineUsers }) => {
    const filtered = contacts.filter(c =>
        (c.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        c.email.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="w-full md:w-80 bg-card/80 backdrop-blur-xl border-r border-border flex flex-col h-full">
            <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Mensagens</h2>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground"><MoreVertical className="h-4 w-4" /></Button>
                </div>
                <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={searchTerm} onChange={e => onSearch(e.target.value)} className="pl-10 bg-muted border-border text-foreground" />
                </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> :
                    filtered.length === 0 ? <div className="text-center py-8 text-muted-foreground">Nenhum contato.</div> :
                        filtered.map(contact => (
                            <div key={contact.id} onClick={() => onSelect(contact)} className={`flex items-center gap-3 p-4 cursor-pointer border-b border-border transition-colors ${selectedContact?.id === contact.id ? 'bg-primary/10 border-l-4 border-l-primary' : 'hover:bg-accent'}`}>
                                <div className="relative">
                                    <Avatar className="border border-border"><AvatarImage src={contact.avatar_url || ''} /><AvatarFallback className="bg-muted text-primary font-bold">{getInitials(contact.full_name, contact.email)}</AvatarFallback></Avatar>
                                    {onlineUsers.has(contact.id) && <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background shadow-[0_0_8px_#22c55e]" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-1">
                                        <div className="flex items-center gap-2 max-w-[70%]">
                                            <h3 className={`font-medium truncate ${selectedContact?.id === contact.id ? 'text-foreground' : 'text-foreground/80'}`}>{contact.full_name || contact.email}</h3>
                                            {contact.role === 'admin' && <Badge variant="destructive" className="h-4 px-1 text-[10px]">Admin</Badge>}
                                            {contact.role === 'professional' && <Badge variant="secondary" className="h-4 px-1 text-[10px] bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Prof</Badge>}
                                            {contact.role === 'client' && <Badge variant="outline" className="h-4 px-1 text-[10px] text-muted-foreground border-border">Aluno</Badge>}
                                        </div>
                                        <span className="text-[10px] text-muted-foreground shrink-0">{formatSidebarDate(contact.last_message_time)}</span>
                                    </div>
                                    <div className="flex justify-between"><p className="text-xs text-muted-foreground truncate max-w-[140px]">{contact.last_message || 'Iniciar conversa...'}</p>{contact.unread_count ? <Badge className="h-5 px-1.5 bg-primary text-primary-foreground font-bold border-none">{contact.unread_count}</Badge> : null}</div>
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}

export default ContactsList
