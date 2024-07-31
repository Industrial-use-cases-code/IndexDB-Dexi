// App.js
import React from 'react';
import { OfflineProvider } from './context/offlineContext';
import { TodoProvider, useTodos } from './services/ToDoProviderService';
import './App.css'

const TodoList = () => {
  const { todos, addTodo, deleteTodo, loading } = useTodos();
  
  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  // if (!Array.isArray(todos)) {
  //   return <div>Todos data is not an array.</div>;
  // }

  console.log('Rendering todos:', todos);

  return (
    <div>
      <h2>Todo List</h2>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>
            {todo.title} - {todo.content}
            <button onClick={() => deleteTodo(todo.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={() => addTodo({ title: 'New Todo', content: 'Content' })}>Add Todo</button>
    </div>
  );
};

const App = () => (
  <OfflineProvider>
    <TodoProvider>
      <h1>Todo App with Offline Support</h1>
      <TodoList />
    </TodoProvider>
  </OfflineProvider>
);

export default App;