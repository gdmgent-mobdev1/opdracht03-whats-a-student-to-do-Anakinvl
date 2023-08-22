import {
  getAuth,
  GoogleAuthProvider,
  // onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithRedirect,
  getRedirectResult,
  // sendPasswordResetEmail,
  // signInWithRedirect,
} from 'firebase/auth';

import {
  getFirestore,
  collection,
  addDoc,
} from 'firebase/firestore';

import Component from '../lib/Components';
import { fireStoreApp } from '../lib/firebase-init';

class LoginComponent extends Component {
  private email: string;

  private password: string;

  constructor(email: string, password: string) {
    super({
      name: 'Login',
      model: {},
    });

    this.email = email;
    this.password = password;
  }

  public register() {
    const auth = getAuth(fireStoreApp);
    createUserWithEmailAndPassword(auth, this.email, this.password)
      .then(() => {
        console.log('Successfully registered user!');
        // Add user data to Firestore
        const db = getFirestore(fireStoreApp);
        const usersCollection = collection(db, 'users');

        addDoc(usersCollection, {
          email: this.email,
          password: this.password,
        })
          .then(() => {
            console.log('Document successfully written to Firestore!');
          })
          .catch((error) => {
            console.log('Error writing document to Firestore: ', error);
          });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  public login() {
    const auth = getAuth(fireStoreApp);
    signInWithEmailAndPassword(auth, this.email, this.password)
      .then(() => {
        console.log('Successfully logged in!');
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
}
const googleAuthButton = document.getElementById('google-auth-button');
if (googleAuthButton) {
  const auth = getAuth(fireStoreApp);
  const googleProvider = new GoogleAuthProvider();

  googleAuthButton.addEventListener('click', () => {
    signInWithRedirect(auth, googleProvider);
  });

  // Check for the redirect result when the page loads
  getRedirectResult(auth)
    .then((result) => {
      if (result?.user) {
        console.log('User successfully signed in with Google:', result.user.displayName);
        // You can handle the signed-in user here
      }
    })
    .catch((error) => {
      console.error('Error during Google sign-in redirect:', error.message);
    });
}
export default LoginComponent;
