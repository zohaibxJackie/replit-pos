import { Bell, Check, X, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useNotificationStore } from '@/store/notificationStore';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';

const getNotificationIcon = (type: string) => {
  const iconClass = "w-4 h-4";
  
  switch (type) {
    case 'success':
      return <Check className={cn(iconClass, "text-green-600")} />;
    case 'warning':
      return <Bell className={cn(iconClass, "text-yellow-600")} />;
    case 'error':
      return <X className={cn(iconClass, "text-red-600")} />;
    default:
      return <Bell className={cn(iconClass, "text-blue-600")} />;
  }
};

const getNotificationBg = (type: string) => {
  switch (type) {
    case 'success':
      return 'bg-green-100 dark:bg-green-900/20';
    case 'warning':
      return 'bg-yellow-100 dark:bg-yellow-900/20';
    case 'error':
      return 'bg-red-100 dark:bg-red-900/20';
    default:
      return 'bg-blue-100 dark:bg-blue-900/20';
  }
};

export default function NotificationPanel() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotificationStore();

  useEffect(() => {
    const mockNotifications = [
      {
        id: '1',
        userId: 'user1',
        title: 'New Shop Created',
        message: 'Shop "Tech Store" has been successfully created',
        type: 'success',
        isRead: false,
        actionUrl: '/super-admin/shops',
        createdAt: new Date(Date.now() - 1000 * 60 * 5),
      },
      {
        id: '2',
        userId: 'user1',
        title: 'Subscription Expiring Soon',
        message: 'Shop "Mobile Mart" subscription expires in 3 days',
        type: 'warning',
        isRead: false,
        actionUrl: '/super-admin/shops',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
      },
      {
        id: '3',
        userId: 'user1',
        title: 'New Admin Request',
        message: 'User "john@example.com" requested admin access',
        type: 'info',
        isRead: false,
        actionUrl: '/super-admin/admins',
        createdAt: new Date(Date.now() - 1000 * 60 * 60),
      },
      {
        id: '4',
        userId: 'user1',
        title: 'Payment Failed',
        message: 'Payment failed for Shop "Gadget Hub"',
        type: 'error',
        isRead: true,
        actionUrl: '/super-admin/shops',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      },
    ];
    
    useNotificationStore.getState().setNotifications(mockNotifications as any);
  }, []);

  const handleMarkAsRead = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    markAsRead(id);
  };

  const handleRemove = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    removeNotification(id);
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="relative h-9 w-9 rounded-xl hover:bg-muted/50 transition"
          data-testid="button-notifications"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] px-1 z-10 border-2 border-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs h-7"
              data-testid="button-mark-all-read"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover-elevate cursor-pointer transition-colors",
                    !notification.isRead && "bg-muted/30"
                  )}
                  data-testid={`notification-${notification.id}`}
                >
                  <div className="flex gap-3">
                    <div className={cn("p-2 rounded-lg h-fit", getNotificationBg(notification.type))}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        <div className="flex gap-1">
                          {!notification.isRead && (
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-6 w-6"
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                              data-testid={`button-mark-read-${notification.id}`}
                            >
                              <Check className="w-3 h-3" />
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6"
                            onClick={(e) => handleRemove(notification.id, e)}
                            data-testid={`button-remove-${notification.id}`}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(new Date(notification.createdAt!))}
                        </span>
                        {notification.actionUrl && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 text-xs gap-1"
                            data-testid={`button-view-${notification.id}`}
                          >
                            View
                            <ExternalLink className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
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
