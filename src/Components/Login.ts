import {
  getAuth,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithRedirect,
} from 'firebase/auth';
import Component from '../lib/Components';
// import Elements from '../lib/elements';

class LoginComponent extends Component {
  constructor() {
    // super omdat we overerven en anders een error krijgen
    super({
      name: 'Login',
      model: {},
    });
  }

  private email: string;

  private password: string;

  constructor(email: string, password: string) {
    this.email = email;
    this.password = password;
  }

  public register() {
    // Use Firebase's createUserWithEmailAndPassword
    firebase.auth().createUserWithEmailAndPassword(this.email, this.password)
      .then(() => {
        console.log('Successfully registered user!');
        // Add user data to Firestore
        firebase.firestore().collection('users').add({
          email: this.email,
          password: this.password,
        });
      })
      .catch((error) => {
        console.log(error.message);
      });
  }

  public login() {
    // Use Firebase's signInWithEmailAndPassword
    firebase.auth().signInWithEmailAndPassword(this.email, this.password)
      .then(() => {
        console.log('Successfully logged in!');
      })
      .catch((error) => {
        console.log(error.message);
      });
  }
}

return loginContainer;

export default LoginComponent;
