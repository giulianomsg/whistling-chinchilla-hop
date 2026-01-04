
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ExpandableImageProps {
    src?: string | null
    alt: string
    className?: string
    type?: 'avatar' | 'cover'
    fallback?: string
}

export const ExpandableImage: React.FC<ExpandableImageProps> = ({
    src,
    alt,
    className,
    type = 'avatar',
    fallback
}) => {
    const [isOpen, setIsOpen] = useState(false)
    const imageSrc = src || (type === 'avatar' ? '' : 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=1000&auto=format&fit=crop')

    if (!imageSrc && type === 'avatar') {
        return (
            <Avatar className={className}>
                <AvatarFallback>{fallback || alt?.[0]}</AvatarFallback>
            </Avatar>
        )
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {type === 'avatar' ? (
                    <Avatar className={`${className} cursor-pointer hover:opacity-90 transition-opacity`} onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}>
                        <AvatarImage src={imageSrc} className="object-cover" />
                        <AvatarFallback>{fallback || alt?.[0]}</AvatarFallback>
                    </Avatar>
                ) : (
                    <img
                        src={imageSrc}
                        alt={alt}
                        className={`${className} cursor-pointer hover:opacity-90 transition-opacity`}
                        onClick={(e) => { e.stopPropagation(); setIsOpen(true) }}
                    />
                )}
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-full p-0 bg-transparent border-none shadow-none flex justify-center items-center overflow-hidden" onClick={() => setIsOpen(false)}>
                <div className="relative">
                    <img src={imageSrc} alt={alt} className="max-h-[85vh] w-auto rounded-lg shadow-2xl object-contain bg-black/80 backdrop-blur-sm" />
                </div>
            </DialogContent>
        </Dialog>
    )
}
