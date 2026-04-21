"use client";

export default function Page(){
  function handleLogin(){
    // Direct redirect to backend OAuth endpoint
    window.location.href = 'http://localhost:8000/auth/google';
  }
  
  return (
    <div>
      <button onClick={handleLogin}>login</button>
    </div>
  )
}