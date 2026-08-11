import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBF7bWZzIqv8njP5BFYyfESzBYTBhw9R6Y',
  authDomain: 'different-minds-adhd.firebaseapp.com',
  projectId: 'different-minds-adhd',
  storageBucket: 'different-minds-adhd.firebasestorage.app',
  messagingSenderId: '1034614874436',
  appId: '1:1034614874436:web:ed79c50437a982fe483711',
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);
