import { Outlet, useNavigate } from "react-router-dom";

export default function HomePage() {
    const exercises = ['Chest', 'Back', 'Legs', 'Shoulders', 'Biceps', 'Triceps'];
    const nav = useNavigate();

    return (
        <div className="min-h-screen bg-white text-black">
            <div className="max-w-4xl mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold border-b-2 border-black pb-2 mb-4">
                    Home Page
                </h1>
                <p className="text-lg mb-8">
                    Welcome to the home page of our application!
                </p>

                <Outlet />

                <h2 className="text-2xl font-semibold mb-4">Exercises</h2>
                <ul className="space-y-2">
                    {exercises.map((exercise, index) => (
                        <li
                            key={index}
                            onClick={() => nav(`/exercises/${exercise}`)}
                            className="cursor-pointer border border-black px-4 py-2 rounded-md transition-colors duration-200 hover:bg-black hover:text-white"
                        >
                            {exercise}
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}