"use client";


import { useAuthStore } from '@/stores/authStore';


export default function Page(){
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <h1>Test Page</h1>
      {user ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please log in.</p>
      )}
    </div>
  );
}
