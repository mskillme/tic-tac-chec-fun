import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

// Get or create anonymous user session
// This replaces the old device ID system with proper anonymous authentication
export const getDeviceId = async (): Promise<string> => {
  // Check for existing session
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user?.id) {
    return session.user.id;
  }
  
  // Sign in anonymously if no session exists
  const { data, error } = await supabase.auth.signInAnonymously();
  
  if (error) {
    logger.error('Error signing in anonymously', error);
    throw new Error('Failed to authenticate');
  }
  
  if (data.user?.id) {
    return data.user.id;
  }
  
  throw new Error('Failed to get user ID');
};
