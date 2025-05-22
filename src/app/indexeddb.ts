// Make sure to install idb: npm install idb
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'periskope-chat';
const DB_VERSION = 1;

type Chat = { id: string; name: string };
type Message = { id: string; chat_id: string; [key: string]: any };

type PeriskopeDB = {
  chats: Chat;
  messages: Message;
};

// Only create DB on client side
const dbPromise = typeof window !== 'undefined' 
  ? openDB<PeriskopeDB>(DB_NAME, DB_VERSION, {
      upgrade(db: IDBPDatabase<PeriskopeDB>) {
        if (!db.objectStoreNames.contains('chats')) {
          db.createObjectStore('chats', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('messages')) {
          db.createObjectStore('messages', { keyPath: 'id' });
        }
      },
    })
  : null;

// Chats
export async function saveChats(chats: Chat[]) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('chats', 'readwrite');
  for (const chat of chats) {
    tx.store.put(chat);
  }
  await tx.done;
}

export async function getChats(): Promise<Chat[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll('chats');
}

export async function deleteChat(chatId: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('chats', chatId);
}

// Messages
export async function saveMessages(messages: Message[]) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const tx = db.transaction('messages', 'readwrite');
  for (const msg of messages) {
    tx.store.put(msg);
  }
  await tx.done;
}

export async function getMessagesByChat(chatId: string): Promise<Message[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  const all = await db.getAll('messages');
  return all.filter((msg: Message) => msg.chat_id === chatId);
} 