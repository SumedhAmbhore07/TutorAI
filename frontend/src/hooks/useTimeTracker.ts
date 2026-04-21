import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

export const useTimeTracker = () => {
    const { currentUser } = useAuth();
    
    useEffect(() => {
        if (!currentUser) return;

        // Run every 30 seconds
        const heartbeatInterval = 30000;

        const interval = setInterval(() => {
            // Only count time if user is actively looking at the page
            if (document.visibilityState === 'visible') {
                fetch('/api/stats/time/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        user_uid: currentUser.uid,
                        seconds: heartbeatInterval / 1000
                    })
                }).catch(err => console.error("Time tracking error", err));
            }
        }, heartbeatInterval);

        return () => clearInterval(interval);
    }, [currentUser]);
};
