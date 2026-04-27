"use client";

import { api } from "@/api/axios";
import { useMutation } from "@tanstack/react-query";

export default function TasksPage() {

    const mutation = useMutation({
        mutationFn: async () =>
            await generateText(
                "tell me a joke."
            ),

        onSuccess: (data) => {
            console.log("Generated text:", data);
        }
    });

    const handleGenerate = () => {
        mutation.mutate();
    };

    return (
        <div>
            <h1>tasks page</h1>

            <button onClick={handleGenerate}>
                click
            </button>

            {mutation.isPending && (
                <p>Loading...</p>
            )}

            {mutation.data && (
                <div>
                    <h3>Response:</h3>

                    <p>
                        {mutation.data.data}
                    </p>
                </div>
            )}

            {mutation.error && (
                <p>Error occurred</p>
            )}
        </div>
    );
}

async function generateText(prompt: string) {

    const response = await api.post(
        "/tasks/generate",
        { prompt }
    );

    return response.data;
}