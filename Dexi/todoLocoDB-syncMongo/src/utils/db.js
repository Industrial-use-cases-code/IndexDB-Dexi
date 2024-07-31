// db.js
import Dexie from 'dexie';

export const db = new Dexie('TodoDatabase');
db.version(1).stores({
  todos: '++id,title,content,done',
  doneTodos: '++id,_id'
});
