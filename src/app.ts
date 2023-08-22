/* eslint-disable no-new */
import {
  doc as firestoreDoc, addDoc, collection, getDocs, writeBatch, increment,
  query, orderBy,
} from 'firebase/firestore';
import {
  getAuth, onAuthStateChanged, User,
} from 'firebase/auth';
import LoginComponent from './Components/Login';
import { fireStoreApp, fireStoreDb } from './lib/firebase-init';
import Card from './Components/Card';
import TodoList from './Components/TodoList';
import Timer from './Components/Timer';
import { Project } from './Components/Project';
// import localstorage from './Lib/localStorage';
// -------------main------------
document.addEventListener('DOMContentLoaded', () => {
  const auth = getAuth(fireStoreApp);
  const logoutButton = document.getElementById('logout-button');

  const addTodoListInput = document.getElementById('addTodoListInput') as HTMLInputElement;
  const addTodoListButton = document.getElementById('addTodoListButton') as HTMLElement;
  const root = document.getElementById('app');

  interface CardData {
    id: string;
    title: string;
  }

  function handleProjectContainerVisibility(user: User | null) {
    const projectContainer = document.getElementById('project-container');

    if (user) {
    // User is logged in, show the project container and the logout button
      if (projectContainer) {
        projectContainer.style.display = 'block';
      }
      if (logoutButton) {
        logoutButton.style.display = 'block';
      }
    } else {
    // User is not logged in, hide the project container and the logout button
      if (projectContainer) {
        projectContainer.style.display = 'none';
      }
      if (logoutButton) {
        logoutButton.style.display = 'none';
      }
    }
  }

  async function fetchListsFromFirestore(userId: string) {
    const userListsCollection = collection(fireStoreDb, `users/${userId}/projects`);
    const listsSnapshot = await getDocs(userListsCollection);

    const lists: any[] = [];
    await Promise.all(listsSnapshot.docs.map(async (listDoc) => {
      const listData = listDoc.data();
      const listId = listDoc.id;

      const cardsCollection = collection(userListsCollection, `${listId}/cards`);
      const cardsSnapshot = await getDocs(cardsCollection);

      const cards: CardData[] = []; // Explicitly typed as CardData[]
      cardsSnapshot.forEach((cardDoc) => {
        const cardData = cardDoc.data();

        // Check if the cardData has the 'title' property before pushing
        if ('title' in cardData) {
          cards.push({ ...cardData, id: cardDoc.id });
        } else {
          console.error(`Card with ID ${cardDoc.id} is missing the 'title' property.`);
        }
      });

      lists.push({ ...listData, id: listId, cards });
    }));

    return lists;
  }

  async function fetchAndDisplayProjects(userId: string, projects: Project[]) {
    projects.forEach((project) => {
      // Update the title element in the HTML
      const projectTitleElement = document.getElementById('project-title');
      if (projectTitleElement) {
        projectTitleElement.textContent = project.title;
      }

      project.render();
    });

    // Check if the root element exists before manipulating it
    const root = document.getElementById('app');
    if (root) {
      // Clear existing content
      root.innerHTML = '';

      // Loop through projects and create Project instances
      projects.forEach((project) => {
        project.render();
      });
    } else {
      console.error("Root element 'app' not found.");
    }
  }

  async function fetchAndDisplayLists(userId: string) {
    const lists = await fetchListsFromFirestore(userId);

    // Clear existing content
    root.innerHTML = '';

    // Loop through lists and create TodoList instances
    lists.forEach((list) => {
      const listTitle = list.title;
      const listId = list.id;
      const todoListInstance = new TodoList(root, listTitle);
      todoListInstance.id = listId;

      // Loop through cards in the list and create Card instances
      list.cards.forEach((card: CardData) => { // Explicitly type card as CardData
        const newCard = new Card(card.title, root, todoListInstance, card.id, userId);
        todoListInstance.cardArray.push(newCard);
      });
    });
  }

  async function createProjectInFirestore(userId: string, title: string) {
    const userProjectsRef = collection(fireStoreDb, `users/${userId}/projects`);
    const projectDocRef = await addDoc(userProjectsRef, {
      title,
      lists: [],
    });

    return projectDocRef.id;
  }

  async function updateUserScores(userIds: string[], points: number) {
    const batch = writeBatch(fireStoreDb);

    userIds.forEach((userId) => {
      const userDocRef = firestoreDoc(fireStoreDb, 'users', userId);
      const userScoreField = 'score';

      batch.update(userDocRef, { [userScoreField]: increment(points) });
    });

    await batch.commit();
  }

  // Function to fetch and return leaderboard data
  async function fetchLeaderboard() {
    const usersCollectionRef = collection(fireStoreDb, 'users');
    const querySnapshot = await getDocs(query(usersCollectionRef, orderBy('score', 'desc')));

    const leaderboardData = querySnapshot.docs.map((doc) => ({
      userId: doc.id,
      score: doc.data().score || 0,
    }));

    return leaderboardData;
  }

  addTodoListButton.addEventListener('click', async () => {
    if (addTodoListInput.value.trim() !== '') {
      const user = auth.currentUser;
      if (user) {
        const projectId = await createProjectInFirestore(user.uid, addTodoListInput.value);

        // Use projectId here or in subsequent code
        console.log('New project ID:', projectId);

        // Update UI or perform other actions related to the new project
        // ...
      }
      addTodoListInput.value = '';
    }
  });

  const registerButton = document.getElementById('register-button');
  if (registerButton) {
    registerButton.addEventListener('click', () => {
      const registrationEmail = document.getElementById('registration-email') as HTMLInputElement;
      const registrationPassword = document.getElementById('registration-password') as HTMLInputElement;
      if (registrationEmail && registrationPassword) {
        const loginComponent = new LoginComponent(
          registrationEmail.value,
          registrationPassword.value,
        );
        loginComponent.register();
      }
    });
  }

  const loginButton = document.getElementById('login-button');
  if (loginButton) {
    loginButton.addEventListener('click', () => {
      const loginEmail = document.getElementById('login-email') as HTMLInputElement;
      const loginPassword = document.getElementById('login-password') as HTMLInputElement;
      if (loginEmail && loginPassword) {
        const loginComponent = new LoginComponent(loginEmail.value, loginPassword.value);
        loginComponent.login();
      }
    });

    onAuthStateChanged(auth, (user) => {
      handleProjectContainerVisibility(user);
      if (user) {
        fetchAndDisplayLists(user.uid);
      }
    });

    const timer = new Timer();

    document.getElementById('start-timer')?.addEventListener('click', () => {
      const targetTimeInput = document.getElementById('target-time-input') as HTMLInputElement;
      const targetTime = parseInt(targetTimeInput.value, 10) * 60 * 1000;
      timer.startTimerWithTargetTime(targetTime);
    });

    document.getElementById('pause-timer')?.addEventListener('click', () => {
      clearInterval(timer.int);
    });

    document.getElementById('reset-timer')?.addEventListener('click', () => {
      clearInterval(timer.int);
      timer.reset(); // Call the reset method
    });

    const sharedTaskUserIds = ['userId1', 'userId2']; // Example user IDs involved in sharing the task
    const sharedTaskPoints = 1; // Points to award for sharing a task
    updateUserScores(sharedTaskUserIds, sharedTaskPoints);

    // Example: Fetching and displaying leaderboard data
    fetchLeaderboard().then((leaderboardData) => {
      // Display leaderboardData on your UI
    });
  }

  //   fetchLeaderboard().then((leaderboardData) => {
  //     // Display leaderboardData on your UI
  //     const leaderboardContainer = document.getElementById('leaderboard-container');
  //     if (leaderboardContainer) {
  //       leaderboardContainer.innerHTML = ''; // Clear existing content

//       leaderboardData.forEach((entry) => {
//         const entryElement = document.createElement('div');
//         entryElement.textContent = `User: ${entry.userId}, Score: ${entry.score}`;
//         leaderboardContainer.appendChild(entryElement);
//       });
//     }
//   });
// });
});
