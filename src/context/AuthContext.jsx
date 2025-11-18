import React, { createContext, useContext, useState, useEffect } from 'react';
// import { auth } from '../config/firebase';
// import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
// import { authAPI } from '../services/api';
import { mockAuthAPI as authAPI } from '../services/mockApi';

// Mock auth for development
const mockAuth = {
    currentUser: null,
    signOut: async () => {
        mockAuth.currentUser = null;
    }
};

// Mock onAuthStateChanged - Firebase style (auth, callback)
const onAuthStateChanged = (authInstance, callback) => {
    // Simulate logged in user after a delay
    setTimeout(() => {
        mockAuth.currentUser = {
            uid: 'mock-uid-123',
            email: '2051120001@vku.udn.vn',
            displayName: 'Nguyễn Văn An',
            photoURL: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
            getIdToken: async () => 'mock-token-123'
        };
        callback(mockAuth.currentUser);
    }, 500);

    // Return unsubscribe function
    return () => { };
};

const auth = mockAuth;
const firebaseSignOut = mockAuth.signOut;

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get Firebase ID token
                    const idToken = await firebaseUser.getIdToken();

                    // Verify with backend
                    const response = await authAPI.login(idToken);

                    // Store token
                    localStorage.setItem('authToken', idToken);

                    setUser({
                        ...response.data,
                        firebaseUser,
                    });
                } catch (error) {
                    console.error('Auth error:', error);
                    setUser(null);
                    localStorage.removeItem('authToken');
                }
            } else {
                setUser(null);
                localStorage.removeItem('authToken');
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            localStorage.removeItem('authToken');
        } catch (error) {
            console.error('Sign out error:', error);
        }
    };

    const value = {
        user,
        loading,
        signOut,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
