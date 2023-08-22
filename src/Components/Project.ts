import { collection, getDocs, addDoc } from 'firebase/firestore';
import { fireStoreDb } from '../lib/firebase-init';
import TodoList from './TodoList'; // Import TodoList class
import { root } from '../lib'; // Import root element

class Project {
  title: string; // Define title property

  userId: string;

  lists: TodoList[];

  constructor(title: string, userId: string) {
    this.title = title;
    this.userId = userId;
    this.lists = [];
  }

  async createTodoList(title: string) {
    const newList = new TodoList(root, this.userId, title); // Use root element
    this.lists.push(newList);
  }

  render() {
    const projectContainer = document.getElementById('project-container')!;
    const projectElement = document.createElement('div');
    projectElement.className = 'project';
    projectElement.innerText = this.title;
    projectContainer.appendChild(projectElement);

    projectElement.addEventListener('click', () => {
      this.showLists();
    });
  }

  async showLists() {
    // Clear existing content
    root.innerHTML = '';

    // Render project title
    const projectTitleElement = document.createElement('h2');
    projectTitleElement.innerText = this.title;
    root.appendChild(projectTitleElement);

    // Render todo lists
    this.lists.forEach((list) => {
      list.render();
    });
  }
}

interface ProjectData {
  id: string;
  title: string;
  lists: any[]; // Adjust this type to match your list structure
}

async function fetchProjectsFromFirestore(userId: string): Promise<ProjectData[]> {
  const userProjectsRef = collection(fireStoreDb, `users/${userId}/projects`);
  const projectsSnapshot = await getDocs(userProjectsRef);

  const projects: ProjectData[] = [];
  projectsSnapshot.forEach((projectDoc) => {
    const projectData = projectDoc.data();
    const project: ProjectData = {
      id: projectDoc.id,
      title: projectData.title,
      lists: projectData.lists || [],
    };
    projects.push(project);
  });

  return projects;
}

async function createProjectInFirestore(title: string, userId: string) {
  const userProjectsRef = collection(fireStoreDb, `users/${userId}/projects`);
  const projectDocRef = await addDoc(userProjectsRef, {
    title,
    lists: [],
  });

  return projectDocRef.id;
}

async function addTodoListToProjectInFirestore(title: string, userId: string, projectId:string) {
  const projectListsRef = collection(fireStoreDb, `users/${userId}/projects/${projectId}/lists`);
  const listDocRef = await addDoc(projectListsRef, {
    title,
    cards: [],
  });

  return listDocRef.id;
}

interface ListData {
  id: string;
  title: string;
  cards: any[]; // Adjust this type to match your card structure
}

async function fetchListsFromProjectInFirestore(userId: string, projectId: string):
Promise<ListData[]> {
  const projectListsRef = collection(fireStoreDb, `users/${userId}/projects/${projectId}/lists`);
  const listsSnapshot = await getDocs(projectListsRef);

  const lists: ListData[] = [];
  listsSnapshot.forEach((listDoc) => {
    const listData = listDoc.data();
    const list: ListData = {
      id: listDoc.id,
      title: listData.title,
      cards: listData.cards || [],
    };
    lists.push(list);
  });

  return lists;
}

export {
  Project,
  fetchProjectsFromFirestore,
  createProjectInFirestore,
  addTodoListToProjectInFirestore,
  fetchListsFromProjectInFirestore,
};
