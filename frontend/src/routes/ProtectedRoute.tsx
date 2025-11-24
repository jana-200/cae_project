import { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { UserContext } from '../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { UserDetails } from '../types';

interface ProtectedRouteProps extends PropsWithChildren {
  requiresAuth?: boolean;
  redirectIfAuthenticated?: boolean;
  allowedRoles?: string[];
  disallowVolunteer?: boolean;
}

export default function ProtectedRoute({
  children,
  requiresAuth = false,
  redirectIfAuthenticated = false,
  allowedRoles,
  disallowVolunteer,
}: ProtectedRouteProps) {
  const { authenticatedUser, fetchUserDetails } = useContext(UserContext);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const response = await fetchUserDetails();
        setUserDetails(response);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    if (authenticatedUser) {
      fetchDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser]);

  useEffect(() => {
    if (authenticatedUser) {
      if (redirectIfAuthenticated) {
        navigate('/', { replace: true });
      }

      if (
        allowedRoles &&
        userDetails &&
        !allowedRoles.includes(userDetails.role)
      ) {
        navigate('/', { replace: true });
      }

      if (
        disallowVolunteer &&
        userDetails?.email === 'volunteer@terroircie.be'
      ) {
        navigate('/', { replace: true });
      }
    } else if (requiresAuth && !authenticatedUser) {
      navigate('/login', { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authenticatedUser, userDetails]);

  return children;
}
