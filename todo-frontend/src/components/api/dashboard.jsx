import { useState, useEffect } from "react";
import { createTodo, getTodos, updateTodo, deleteTodo } from "../api/api";

function Dashboard({ user }) {

    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [error, setError] = useState("");

    // Kis todo ko edit kar rahe hain
    const [editingId, setEditingId] = useState(null);

    // Edit ke waqt title
    const [editTitle, setEditTitle] = useState("");


    // =========================
    // GET TODOS
    // =========================

    async function fetchTodos() {

        try {

            const data = await getTodos({
                user_id: user.id
            });

            setTodos(data);

        } catch (err) {

            setError(err.message);

        }
    }


    useEffect(() => {

        fetchTodos();

    }, []);


    // =========================
    // CREATE TODO
    // =========================

    async function handleAddTodo(e) {

        e.preventDefault();

        setError("");

        try {

            await createTodo({
                title: title,
                user_id: user.id
            });

            // Input empty
            setTitle("");

            // Database se updated todos lao
            fetchTodos();

        } catch (err) {

            setError(err.message);

        }
    }


    // =========================
    // START EDIT
    // =========================

    function handleEdit(todo) {

        // jis todo ko edit karna hai uski id
        setEditingId(todo.id);

        // uska current title input mein
        setEditTitle(todo.title);

    }


    // =========================
    // UPDATE TODO
    // =========================

    async function handleUpdate(todoId) {

        setError("");

        try {

            await updateTodo(todoId, {
                title: editTitle
            });

            // Editing mode band
            setEditingId(null);

            // Input empty
            setEditTitle("");

            // Updated todos dobara lao
            fetchTodos();

        } catch (err) {

            setError(err.message);

        }
    }


    // =========================
    // DELETE TODO
    // =========================

    async function handleDelete(todoId) {

        setError("");

        try {

            await deleteTodo(todoId);

            // Delete ke baad todos dobara lao
            fetchTodos();

        } catch (err) {

            setError(err.message);

        }
    }


    return (

        <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10">

            {/* =========================
                WELCOME
            ========================= */}

            <h1 className="text-3xl font-bold mb-6">

                Welcome, {user.username}!

            </h1>


            {/* =========================
                ADD TODO
            ========================= */}

            <form
                onSubmit={handleAddTodo}
                className="flex gap-2 mb-6 w-96"
            >

                <input
                    type="text"
                    placeholder="New todo..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="flex-1 border p-2 rounded"
                    required
                />

                <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                    Add
                </button>

            </form>


            {/* =========================
                ERROR
            ========================= */}

            {error && (

                <p className="text-red-500 mb-4">

                    {error}

                </p>

            )}


            {/* =========================
                TODOS
            ========================= */}

            <div className="w-96 space-y-2">

                {todos.length === 0 && (

                    <p className="text-gray-500 text-center">

                        No todos yet.

                    </p>

                )}


                {todos.map((todo) => (

                    <div
                        key={todo.id}
                        className="bg-white p-3 rounded shadow"
                    >

                        {editingId === todo.id ? (

                            // =========================
                            // EDIT MODE
                            // =========================

                            <div className="flex gap-2">

                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) =>
                                        setEditTitle(e.target.value)
                                    }
                                    className="flex-1 border p-2 rounded"
                                />

                                <button
                                    onClick={() =>
                                        handleUpdate(todo.id)
                                    }
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                >
                                    Save
                                </button>

                                <button
                                    onClick={() => {
                                        setEditingId(null);
                                        setEditTitle("");
                                    }}
                                    className="bg-gray-400 text-white px-3 py-1 rounded"
                                >
                                    Cancel
                                </button>

                            </div>

                        ) : (

                            // =========================
                            // NORMAL MODE
                            // =========================

                            <div className="flex justify-between items-center">

                                <span>
                                    {todo.title}
                                </span>

                                <div className="flex gap-2">

                                    <button
                                        onClick={() =>
                                            handleEdit(todo)
                                        }
                                        className="bg-yellow-500 text-white px-3 py-1 rounded"
                                    >
                                        Edit
                                    </button>

                                    <button
                                        onClick={() =>
                                            handleDelete(todo.id)
                                        }
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>

                        )}

                    </div>

                ))}

            </div>

        </div>

    );
}


export default Dashboard;           