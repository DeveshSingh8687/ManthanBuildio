import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AuthContextType = {
  isTermsAccepted: boolean | null;
  loading: boolean;
  checkTermsAcceptance: () => Promise<boolean>;
  setTermsAccepted: (value: boolean) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: React.ReactNode}) => {
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if terms are accepted on app load
  useEffect(() => {
    checkTermsAcceptance();
  }, []);

  const checkTermsAcceptance = async () => {
    try {
      const termsAccepted = await AsyncStorage.getItem('is_terms_accepted');
      setIsTermsAccepted(termsAccepted === 'true');
    } catch (error) {
      console.error('Error checking terms acceptance:', error);
      setIsTermsAccepted(false);
    } finally {
      setLoading(false);
    }
  };

  const setTermsAccepted = async (value: boolean) => {
    try {
      await AsyncStorage.setItem('is_terms_accepted', String(value));
      setIsTermsAccepted(value);
    } catch (error) {
      console.error('Error setting terms acceptance:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        isTermsAccepted,
        loading,
        checkTermsAcceptance,
        setTermsAccepted,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
