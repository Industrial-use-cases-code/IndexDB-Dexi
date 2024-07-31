// TodoService.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import {db} from '../utils/db'
import axios from 'axios';
import { useOffline } from '../context/offlineContext';

const TodoContext = createContext();


export const TodoProvider = ({ children }) => {
  const [todos, setTodos] = useState([]);
  const [doneTodos, setDoneTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const isOnline = useOffline();

  useEffect(() => {

    const fetchTodos = async () => {
      try {
        if (isOnline) {
          const response = await axios.get('http://localhost:8000/todos');
          setTodos(response.data.data);
        } else {
          const allItems = await db.todos.toArray();
          setTodos(allItems);
        }
      } catch (error) {
        console.error('Error fetching todos:', error);
      }
    };

    fetchTodos();
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) {
      syncTodos();
      syncDoneTodos();
    }
  }, [isOnline]);

  const syncTodos = async () => {
    try {
      const allItems = await db.todos.toArray();
      if (allItems.length) {
        await axios.post('http://localhost:8000/bulk', allItems);
        await db.todos.clear();
      }
    } catch (error) {
      console.error('Error syncing todos:', error);
    }
  };

  const syncDoneTodos = async () => {
    try {
      const allItems = await db.doneTodos.toArray();
      if (allItems.length) {
        await axios.delete('http://localhost:8000/bulkDelete', { data: allItems });
        await db.doneTodos.clear();
      }
    } catch (error) {
      console.error('Error syncing done todos:', error);
    }
  };

  const addTodo = async (todo) => {
    todo.done = false;
    if (!isOnline) {
      try {
        await db.todos.add(todo);
        setTodos((prev) => [...prev, todo]);
        console.log('Added todo offline:', todo);
      } catch (error) {
        console.error('Error adding todo offline:', error);
      }
    } else {
      try {
        const response = await axios.post('http://localhost:8000/todos', todo);
        setTodos((prev) => [...prev, response.data]);
        console.log('Added todo online:', response.data);
      } catch (error) {
        console.error('Error adding todo online:', error);
      }
    }
  };

  const deleteTodo = async (todoId) => {
    if (!isOnline) {
      try {
        await db.doneTodos.add({ _id: todoId });
        setDoneTodos((prev) => [...prev, { _id: todoId }]);
        console.log('Marked todo for deletion offline:', todoId);
      } catch (error) {
        console.error('Error marking todo for deletion offline:', error);
      }
    } else {
      try {
        await axios.delete(`http://localhost:8000/todo/${todoId}`);
        setTodos((prev) => prev.filter(todo => todo.id !== todoId));
        console.log('Deleted todo online:', todoId);
      } catch (error) {
        console.error('Error deleting todo online:', error);
      }
    }
  };

  return (
    <TodoContext.Provider value={{ todos, addTodo, deleteTodo, loading }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => useContext(TodoContext);