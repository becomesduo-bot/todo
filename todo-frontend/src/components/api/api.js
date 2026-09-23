const BASE_URL = "http://127.0.0.1:8000";

export async function signupUser(userData) {
  const response = await fetch(`${BASE_URL}/users/signup`, {    // "singup" ki jagah "signup"
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Signup failed");
  }

  return response.json();
}


export async function loginUser(userData) {
  const response = await fetch(`${BASE_URL}/users/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Login failed");
  }

  return response.json();
}



export async function createTodo(todoData) {
  const response = await fetch(`${BASE_URL}/todo/create`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(todoData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to create todo");
  }

  return response.json();
}

export async function getTodos(userData) {
  const response = await fetch(`${BASE_URL}/todo/get`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to fetch todos");
  }

  return response.json();
}


export async function updateTodo(todoId, updateTodo) {
  const response = await fetch(`&{BASE_URL}/todo/update`, {
    method: "PUT",
    headers: { "content_Type": "application/json" },
    body: JSON.stringify(todoId, updateTodo),
  }
  );
  if (!response.ok) {
    const errordata = await response.json();
    throw new Error(errorData.detail || "failed updates todo")

  }
  return response.json();
}

export async function deleteTodo(todoID) {
  const response = await fetch(`${BASE_URL}/todo/delete`,

    {
      "method": "DELETE",
      "headeers": { "Content-Type": "application/json" },
      "body": JSON.stringify(todoID),

    }
  );
  if (!response.ok) {
    const errorData = response.JSON();
    throw new error(errorData.detail || "failed to delete todo")
  }
  return response.json();
}

