import {
  Button,
  Card,
  CardContent,
  Typography,
  Chip,
  Stack,
  Box,
} from '@mui/material';
import { NotificationContext } from '../../contexts/NotificationContext';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../contexts/UserContext';

const NotificationsPage = () => {
  const { notifications, markAsRead, markAllAsRead, fetchNotifications } =
    useContext(NotificationContext);
  const { authenticatedUser } = useContext(UserContext);
  const validNotifications = Array.isArray(notifications) ? notifications : [];

  const [hoveredCardId, setHoveredCardId] = useState<number | null>(null);

  const handleMarkAsRead = async (id: number) => {
    try {
      await markAsRead(id);
      await fetchNotifications();
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      if (!authenticatedUser?.email) {
        console.error("Email de l'utilisateur introuvable.");
        return;
      }
      await markAllAsRead(authenticatedUser.email);
      await fetchNotifications();
    } catch (error) {
      console.error(
        'Erreur lors de la mise à jour de toutes les notifications',
        error,
      );
    }
  };

  useEffect(() => {
    if (authenticatedUser?.email) {
      fetchNotifications();
    }
  }, [fetchNotifications, authenticatedUser]);

  return (
    <Box
      sx={{
        padding: { xs: '1rem', md: '2rem' },
        maxWidth: '900px',
        margin: 'auto',
      }}
    >
      <Typography variant="h4" gutterBottom align="center" fontWeight="bold">
        Mes Notifications
      </Typography>

      <Typography mb={3} align="center" color="text.secondary">
        Cliquez sur une notification pour la marquer comme lue.
      </Typography>

      <Box textAlign="center" mb={5}>
        <Button
          variant="contained"
          onClick={handleMarkAllAsRead}
          sx={{
            borderRadius: '30px',
            textTransform: 'none',
            paddingX: 4,
            paddingY: 1,
            fontWeight: 'bold',
          }}
        >
          Marquer tout comme lu
        </Button>
      </Box>

      {validNotifications.length === 0 ? (
        <Typography align="center" color="text.secondary">
          Aucune notification pour le moment.
        </Typography>
      ) : (
        <Stack spacing={3}>
          {validNotifications.map((notif) => (
            <Card
              key={notif.id}
              data-testid={`notification-card-${notif.id}`}
              variant="outlined"
              onMouseEnter={() => setHoveredCardId(notif.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onClick={() =>
                notif.status === 'UNREAD' && handleMarkAsRead(notif.id)
              }
              sx={{
                backgroundColor:
                  notif.status === 'UNREAD'
                    ? 'rgba(255, 247, 230, 0.8)'
                    : 'background.paper',
                boxShadow:
                  hoveredCardId === notif.id
                    ? '0 6px 18px rgba(0,0,0,0.1)'
                    : '0 2px 8px rgba(0,0,0,0.05)',
                transform:
                  hoveredCardId === notif.id ? 'translateY(-4px)' : 'none',
                transition: 'all 0.3s ease',
                borderRadius: 3,
                cursor: notif.status === 'UNREAD' ? 'pointer' : 'default',
                opacity: notif.status === 'UNREAD' ? 1 : 0.7,
              }}
            >
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}
                  mb={1}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {notif.notificationTitle}
                  </Typography>
                  <Chip
                    label={notif.status === 'UNREAD' ? 'Non lue' : 'Lue'}
                    color={notif.status === 'UNREAD' ? 'warning' : 'success'}
                    size="small"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Stack>

                <Typography variant="body1" color="text.primary" mb={1}>
                  {notif.message}
                </Typography>

                <Typography variant="caption" color="text.secondary">
                  {new Date(notif.notificationDate).toLocaleString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default NotificationsPage;
