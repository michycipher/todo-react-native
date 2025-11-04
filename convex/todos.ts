import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get all todos - sorted by order
export const getTodos = query({
  handler: async (ctx) => {
    const todos = await ctx.db.query("todos").collect();
    
    // Sort by order field (if it exists), otherwise by createdAt
    return todos.sort((a, b) => {
      // If both have order, sort by order
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // If only a has order, a comes first
      if (a.order !== undefined) return -1;
      // If only b has order, b comes first
      if (b.order !== undefined) return 1;
      // If neither has order, sort by createdAt (newest first)
      return b.createdAt - a.createdAt;
    });
  },
});

// Add a new todo
export const addTodo = mutation({
  args: { title: v.string() },
  handler: async (ctx, args) => {
    const todoId = await ctx.db.insert("todos", {
      title: args.title,
      completed: false,
      createdAt: Date.now(),
    });
    return todoId;
  },
});

// This is to Toggle todo completion
export const toggleTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (todo) {
      await ctx.db.patch(args.id, {
        completed: !todo.completed,
      });
    }
  },
});

// Update a todo's title
export const updateTodo = mutation({
  args: { 
    id: v.id("todos"),
    title: v.string() 
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      title: args.title,
    });
  },
});

// Delete
// export const deleteTodo = mutation({
//   args: { id: v.id("todos") },
//   handler: async (ctx, args) => {
//     await ctx.db.delete(args.id);
//   },
// });

export const deleteTodo = mutation({
  args: { id: v.id("todos") },
  handler: async (ctx, args) => {
    const todo = await ctx.db.get(args.id);
    if (!todo) {
      console.warn("Tried to delete nonexistent todo:", args.id);
      return;
    }
    await ctx.db.delete(args.id);
  },
});



// Clear completed todos
export const clearCompleted = mutation({
  handler: async (ctx) => {
    const todos = await ctx.db.query("todos").collect();
    const completedTodos = todos.filter((todo) => todo.completed);

    for (const todo of completedTodos) {
      await ctx.db.delete(todo._id);
    }
  },
});


export const reorderTodos = mutation({
  args: { orderedIds: v.array(v.id("todos")) },
  handler: async (ctx, args) => {
    // Update the order field for each todo
    for (let i = 0; i < args.orderedIds.length; i++) {
      await ctx.db.patch(args.orderedIds[i], {
        order: i,
      });
    }
  },
});

// default todos (only runs once if DB is empty)
export const seedDefaultTodos = mutation({
  handler: async (ctx) => {
    const existingTodos = await ctx.db.query("todos").collect();

    // Only seed if there are no todos
    if (existingTodos.length === 0) {
      const defaultTodos = [
        "Complete Todo App on Frontend Mentor",
        "Jog around the park 3x",
        "Read for 1 hour",
        "Complete online JavaScript course",
      ];

      for (const title of defaultTodos) {
        await ctx.db.insert("todos", {
          title,
          completed: false,
          createdAt: Date.now(),
        });
      }
    }
  },
});