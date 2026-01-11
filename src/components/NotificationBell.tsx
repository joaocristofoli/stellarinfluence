import { useState } from 'react';
import { Bell, Check, CheckCheck, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotifications';

const typeColors = {
    info: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
};

export function NotificationBell() {
    const [open, setOpen] = useState(false);
    const { data: notifications = [] } = useNotifications();
    const { data: unreadCount = 0 } = useUnreadCount();
    const markAsRead = useMarkAsRead();
    const markAllAsRead = useMarkAllAsRead();

    const handleMarkAllRead = () => {
        markAllAsRead.mutate();
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold">Notificações</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleMarkAllRead}
                            className="text-xs"
                        >
                            <CheckCheck className="w-4 h-4 mr-1" />
                            Marcar todas lidas
                        </Button>
                    )}
                </div>

                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            <Bell className="w-10 h-10 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">Nenhuma notificação</p>
                        </div>
                    ) : (
                        <div className="divide-y">
                            {notifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-muted/50 transition-colors ${!notification.read ? 'bg-primary/5' : ''
                                        }`}
                                    onClick={() => !notification.read && markAsRead.mutate(notification.id)}
                                >
                                    <div className="flex gap-3">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${typeColors[notification.type]}`} />
                                        <div className="flex-1 min-w-0">
                                            <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                                {notification.title}
                                            </p>
                                            {notification.message && (
                                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                                    {notification.message}
                                                </p>
                                            )}
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {formatDistanceToNow(notification.createdAt, { addSuffix: true, locale: ptBR })}
                                            </p>
                                        </div>
                                        {!notification.read && (
                                            <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
