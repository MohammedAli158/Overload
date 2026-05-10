import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

export default function ExerciseDetailsPage() {
  const { exerciseName } = useParams();
  const [details, setDetails] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", weight: 0, reps: 0 });

  useEffect(() => {
    const stored = localStorage.getItem("progressiveOverload");
    if (stored) setDetails(JSON.parse(stored));
  }, []);

  const updateExercise = (exerciseIdx, newExerciseData) => {
    const updated = { ...details };
    updated[exerciseName][exerciseIdx] = newExerciseData;
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

  const addExercise = () => {
    if (!newExercise.name.trim()) {
      setToastMessage("Exercise name is required");
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }
    const updated = { ...details };
    updated[exerciseName] = [
      ...updated[exerciseName],
      {
        name: newExercise.name.trim(),
        weight: Number(newExercise.weight),
        reps: Number(newExercise.reps),
      },
    ];
    localStorage.setItem("progressiveOverload", JSON.stringify(updated));
    setDetails(updated);
    setShowAddModal(false);
    setNewExercise({ name: "", weight: 0, reps: 0 });
    setToastMessage("Exercise added");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // ✅ Progressive overload with muscle‑specific increments
  const getTarget = (reps, weight) => {
    const smallMuscles = ['biceps', 'triceps', 'shoulders', 'miscl'];
    const isSmall = smallMuscles.includes(exerciseName.toLowerCase());
    const increment = isSmall ? 2.5 : 5;

    if (reps > 15) {
      return { reps: 10, weight: weight + increment };
    } else {
      return { reps: reps + 1, weight: weight };
    }
  };

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
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-6">
          <h1 className="text-3xl font-bold">{exerciseName} – Last Session</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
          >
            + Add Exercise
          </button>
        </div>

        {exercises.map((exercise, idx) => {
          const target = getTarget(exercise.reps, exercise.weight);
          return (
            <div key={idx} className="border border-black rounded-md p-4 mb-6">
              <div className="font-bold text-xl mb-2">{exercise.name}</div>

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

              <button
                onClick={() => setConfirmRemove(idx)}
                className="border border-black px-3 py-1 rounded hover:bg-black hover:text-white transition"
              >
                Remove exercise
              </button>

              {confirmRemove === idx && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white border-2 border-black p-6 rounded-md shadow-lg max-w-sm w-full">
                    <p className="mb-4 text-lg">Do you really wanna remove it?</p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => setConfirmRemove(null)}
                        className="bg-green-500 text-black border border-black px-4 py-2 rounded hover:bg-green-700 hover:text-white hover:border-green-700 transition"
                      >
                        NO 
                      </button>
                      <button
                        onClick={() => removeExercise(idx)}
                        className="bg-red-500 text-black border border-black px-4 py-2 rounded hover:bg-red-700 hover:text-white hover:border-red-700 transition"
                      >
                        YES 
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Exercise Modal */}
      {showAddModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white border-2 border-black p-6 rounded-md shadow-lg max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Add New Exercise</h2>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block font-medium mb-1">Exercise Name</label>
                <input
                  type="text"
                  value={newExercise.name}
                  onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                  className="w-full border border-black px-3 py-2 rounded"
                  placeholder="e.g., lateral raise"
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Weight (kg)</label>
                <input
                  type="number"
                  value={newExercise.weight}
                  onChange={(e) => setNewExercise({ ...newExercise, weight: e.target.value })}
                  className="w-full border border-black px-3 py-2 rounded"
                  placeholder="0 for bodyweight"
                />
              </div>
              <div>
                <label className="block font-medium mb-1">Reps</label>
                <input
                  type="number"
                  value={newExercise.reps}
                  onChange={(e) => setNewExercise({ ...newExercise, reps: e.target.value })}
                  className="w-full border border-black px-3 py-2 rounded"
                  placeholder="e.g., 10"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={addExercise}
                className="bg-black text-white px-4 py-2 rounded hover:bg-white hover:text-black border border-black transition"
              >
                Add Exercise
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}