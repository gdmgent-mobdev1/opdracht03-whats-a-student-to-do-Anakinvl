import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  deleteDoc,
  collection,
  addDoc,
  setDoc,
} from 'firebase/firestore';

const firebaseConfig = {

  apiKey: 'AIzaSyCHg8ioQNj4x99eXKI-wAZjfifQHKGnDt0',
  authDomain: 'mod-dev1-herexamen.firebaseapp.com',
  projectId: 'mod-dev1-herexamen',
  storageBucket: 'mod-dev1-herexamen.appspot.com',
  messagingSenderId: '502460878119',
  appId: '1:502460878119:web:af45cd38250a2036caad02',

};

// Initialize Firebase

export const fireStoreApp = initializeApp(firebaseConfig);

// get data from firestore
export const fireStoreDb = getFirestore(fireStoreApp);
export const addTodoFirebase = async (userId: string, text: string) => {
  const userListsCollection = collection(fireStoreDb, `users/${userId}/lists`);

  const docRef = await addDoc(userListsCollection, {
    title: text,
    cards: [],
  });
  return docRef.id;
};

export const updateTodoFirebase = async (
  todoListId: string,
  id: string,
  attribute: string,
  value: string,
) => {
  console.log(todoListId, id, attribute, value);
  if (attribute === 'title') {
    await setDoc(
      doc(fireStoreDb, `lists/${todoListId}/cards`, id),
      {
        title: value,
      },
      { merge: true },
    );
  } else {
    await setDoc(
      doc(fireStoreDb, `lists/${todoListId}/cards`, id),
      {
        description: value,
      },
      { merge: true },
    );
  }
};

export const deleteTodoListFirebase = async (id: string) => {
  await deleteDoc(doc(fireStoreDb, 'lists', id));
};

export const deleteCardFromFirebase = async (todoListId: string, id: string) => {
  await deleteDoc(doc(fireStoreDb, `lists/${todoListId}/cards`, id));
};
