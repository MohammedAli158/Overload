import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ExerciseDetailsPage() {
  const { exerciseName } = useParams();
  const [details, setDetails] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { exerciseIndex, show }
  const [toastMessage, setToastMessage] = useState(null);

  // Load from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("progressiveOverload");
    if (stored) {
      setDetails(JSON.parse(stored));
    }
  }, []);

  // Helper to update localStorage and state
  const updateExercise = (exerciseIdx, newExercise) => {
    const updated = { ...details };
    updated[exerciseName][exerciseIdx] = newExercise;
    localStorage.setItem("progressiveOverload", JSON.stringify(updated));
    setDetails(updated);
  };

  const removeExercise = (exerciseIdx) => {
    const updated = { ...details };
    updated[exerciseName] = updated[exerciseName].filter((_, idx) => idx !== exerciseIdx);
    localStorage.setItem("progressiveOverload", JSON.stringify(updated));
    setDetails(updated);
    setConfirmRemove(null);
    setToastMessage("Exercise removed");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Compute today's target based on current reps/weight
  const getTarget = (reps, weight) => {
    if (reps > 15) {
      return { reps: 10, weight: weight + 5 };
    } else {
      return { reps: reps + 1, weight: weight };
    }
  };

  // Handle "Target reached" – apply progressive overload rule
  const handleTargetReached = (exerciseIdx, currentReps, currentWeight) => {
    const target = getTarget(currentReps, currentWeight);
    const updatedExercise = {
      ...details[exerciseName][exerciseIdx],
      reps: target.reps,
      weight: target.weight,
    };
    updateExercise(exerciseIdx, updatedExercise);
    setToastMessage("Target logged! Next session target updated.");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Handle manual edit of reps or weight
  const handleEdit = (exerciseIdx, field, value) => {
    const updatedExercise = {
      ...details[exerciseName][exerciseIdx],
      [field]: Number(value),
    };
    updateExercise(exerciseIdx, updatedExercise);
  };

  if (!details || !details[exerciseName]) {
    return <div className="p-8 text-black">Loading or no data for {exerciseName}...</div>;
  }

  const exercises = details[exerciseName];

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {/* Toast notification */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold border-b-2 border-black pb-2 mb-6">
          {exerciseName} – Last Session
        </h1>

        {exercises.map((exercise, idx) => {
          const target = getTarget(exercise.reps, exercise.weight);
          return (
            <div key={idx} className="border border-black rounded-md p-4 mb-6">
              <div className="font-bold text-xl mb-2">{exercise.name}</div>

              {/* Editable last session */}
              <div className="flex gap-4 mb-4">
                <label className="flex items-center gap-2">
                  <span className="font-medium">Reps:</span>
                  <input
                    type="number"
                    value={exercise.reps}
                    onChange={(e) => handleEdit(idx, "reps", e.target.value)}
                    className="border border-black px-2 py-1 w-20 text-center"
                  />
                </label>
                <label className="flex items-center gap-2">
                  <span className="font-medium">Weight (kg):</span>
                  <input
                    type="number"
                    value={exercise.weight}
                    onChange={(e) => handleEdit(idx, "weight", e.target.value)}
                    className="border border-black px-2 py-1 w-24 text-center"
                  />
                </label>
              </div>

              {/* Today's target suggestion */}
              <div className="bg-gray-100 p-3 rounded mb-4 border-l-4 border-black">
                <div className="font-semibold">🎯 Today's Target:</div>
                <div>
                  {target.reps} reps {target.weight > 0 ? `@ ${target.weight} kg` : "(bodyweight)"}
                </div>
                <button
                  onClick={() => handleTargetReached(idx, exercise.reps, exercise.weight)}
                  className="mt-2 bg-black text-white px-3 py-1 rounded hover:bg-white hover:text-black border border-black transition"
                >
                  Target reached ✓
                </button>
              </div>

              {/* Remove button triggers confirmation */}
              <button
                onClick={() => setConfirmRemove(idx)}
                className="border border-black px-3 py-1 rounded hover:bg-black hover:text-white transition"
              >
                Remove exercise
              </button>

              {/* Confirmation popup for this exercise */}
              {confirmRemove === idx && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white border-2 border-black p-6 rounded-md shadow-lg max-w-sm w-full">
                    <p className="mb-4 text-lg">Do you really wanna remove it?</p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="bg-white text-black border border-black px-4 py-2 rounded hover:bg-green-700 hover:text-white hover:border-green-700 transition"
                      >
                        NO (green)
                      </button>
                      <button
                        onClick={() => removeExercise(idx)}
                        className="bg-white text-black border border-black px-4 py-2 rounded hover:bg-red-700 hover:text-white hover:border-red-700 transition"
                      >
                        YES (red)
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}