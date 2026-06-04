"use client";


import { useAppSelector } from '@/stores/hooks';


export default function Page(){
  const user = useAppSelector((state) => state.auth.user);

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
