import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";

const STORAGE_KEY = "workoutHistory";

// Helper to get YYYY-MM-DD from Date
const getTodayString = () => new Date().toISOString().split("T")[0];

export default function ExerciseDetailsPage() {
  const { exerciseName } = useParams();
  const [workoutHistory, setWorkoutHistory] = useState({});
  const [selectedDate, setSelectedDate] = useState(getTodayString());
  const [toastMessage, setToastMessage] = useState(null);
  const [confirmRemove, setConfirmRemove] = useState(null); // { exerciseIndex }
  const [showAddModal, setShowAddModal] = useState(false);
  const [newExercise, setNewExercise] = useState({ name: "", weight: 0, reps: 0 });

  // Load history from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setWorkoutHistory(JSON.parse(stored));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(workoutHistory));
  }, [workoutHistory]);

  // Get current day's data for this muscle group
  const currentDayData = workoutHistory[selectedDate] || {};
  const exercises = currentDayData[exerciseName] || [];

  // Helper: find most recent entry for the same exercise before selectedDate
  const getPreviousExerciseData = (exerciseNameToFind, currentDate) => {
    const sortedDates = Object.keys(workoutHistory)
      .filter(date => date < currentDate)
      .sort()
      .reverse(); // most recent first

    for (const date of sortedDates) {
      const day = workoutHistory[date];
      const muscleGroups = Object.keys(day);
      for (const muscle of muscleGroups) {
        const ex = day[muscle]?.find(e => e.name === exerciseNameToFind);
        if (ex) return ex; // return { reps, weight }
      }
    }
    return null; // no previous session
  };

  // Progressive overload rule (same as before, but based on previous session)
  const getTargetFromPrevious = (prevReps, prevWeight) => {
    const smallMuscles = ['biceps', 'triceps', 'shoulders', 'miscl'];
    const isSmall = smallMuscles.includes(exerciseName.toLowerCase());
    const increment = isSmall ? 2.5 : 5;

    if (!prevReps && !prevWeight) {
      // No previous session → suggest starting point
      return { reps: 8, weight: 0 };
    }

    if (prevReps > 15) {
      return { reps: 10, weight: prevWeight + increment };
    } else {
      return { reps: prevReps + 1, weight: prevWeight };
    }
  };

  // Compute target for a specific exercise (using its previous session)
  const getTargetForExercise = (exerciseNameToCheck) => {
    const prev = getPreviousExerciseData(exerciseNameToCheck, selectedDate);
    return getTargetFromPrevious(prev?.reps, prev?.weight);
  };

  // Save entire updated history
  const saveHistory = (newHistory) => {
    setWorkoutHistory(newHistory);
  };

  // Update an exercise in the current day
  const updateExercise = (exerciseIdx, updatedExercise) => {
    const newHistory = { ...workoutHistory };
    if (!newHistory[selectedDate]) newHistory[selectedDate] = {};
    const day = newHistory[selectedDate];
    if (!day[exerciseName]) day[exerciseName] = [];
    day[exerciseName][exerciseIdx] = updatedExercise;
    saveHistory(newHistory);
  };

  // Add a new exercise to current day
  const addExercise = () => {
    if (!newExercise.name.trim()) {
      setToastMessage("Exercise name is required");
      setTimeout(() => setToastMessage(null), 2000);
      return;
    }
    const newHistory = { ...workoutHistory };
    if (!newHistory[selectedDate]) newHistory[selectedDate] = {};
    const day = newHistory[selectedDate];
    if (!day[exerciseName]) day[exerciseName] = [];
    day[exerciseName].push({
      name: newExercise.name.trim(),
      weight: Number(newExercise.weight),
      reps: Number(newExercise.reps),
    });
    saveHistory(newHistory);
    setShowAddModal(false);
    setNewExercise({ name: "", weight: 0, reps: 0 });
    setToastMessage("Exercise added");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Remove an exercise from current day
  const removeExercise = (exerciseIdx) => {
    const newHistory = { ...workoutHistory };
    const day = newHistory[selectedDate];
    if (day && day[exerciseName]) {
      day[exerciseName] = day[exerciseName].filter((_, idx) => idx !== exerciseIdx);
      if (day[exerciseName].length === 0) delete day[exerciseName];
      if (Object.keys(day).length === 0) delete newHistory[selectedDate];
    }
    saveHistory(newHistory);
    setConfirmRemove(null);
    setToastMessage("Exercise removed");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Handle target reached: replace current exercise with target values
  const handleTargetReached = (exerciseIdx, currentExercise) => {
    const target = getTargetForExercise(currentExercise.name);
    const updatedExercise = { ...currentExercise, reps: target.reps, weight: target.weight };
    updateExercise(exerciseIdx, updatedExercise);
    setToastMessage("Target logged! Next session target updated.");
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Handle manual edit of reps or weight
  const handleEdit = (exerciseIdx, field, value) => {
    const exercise = exercises[exerciseIdx];
    if (!exercise) return;
    const updatedExercise = { ...exercise, [field]: Number(value) };
    updateExercise(exerciseIdx, updatedExercise);
  };

  // Small helper for weight display
  const formatWeight = (weight) => (weight > 0 ? `${weight} kg` : "bodyweight");

  return (
    <div className="min-h-screen bg-white text-black p-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-black text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="max-w-3xl mx-auto">
        {/* Header with date picker and add button */}
        <div className="flex flex-wrap justify-between items-center border-b-2 border-black pb-2 mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold">{exerciseName}</h1>
            <div className="mt-2">
              <label className="mr-2 font-medium">Date:</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-black px-2 py-1 rounded"
              />
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="border border-black px-4 py-2 rounded hover:bg-black hover:text-white transition"
          >
            + Add Exercise
          </button>
        </div>

        {/* Exercise list or empty state */}
        {exercises.length === 0 ? (
          <div className="text-center py-12 border border-black rounded-md bg-gray-50">
            <p className="text-lg mb-4">No exercises logged for {exerciseName} on {selectedDate}.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-black text-white px-4 py-2 rounded hover:bg-white hover:text-black border border-black transition"
            >
              Add your first exercise
            </button>
          </div>
        ) : (
          exercises.map((exercise, idx) => {
            const target = getTargetForExercise(exercise.name);
            return (
              <div key={idx} className="border border-black rounded-md p-4 mb-6">
                <div className="font-bold text-xl mb-2">{exercise.name}</div>

                {/* Editable last session (current day's numbers) */}
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
                    <span className="font-medium">Weight:</span>
                    <input
                      type="number"
                      value={exercise.weight}
                      onChange={(e) => handleEdit(idx, "weight", e.target.value)}
                      className="border border-black px-2 py-1 w-24 text-center"
                    />
                    <span className="text-sm">kg</span>
                  </label>
                </div>

                {/* Today's target (based on previous session) */}
                <div className="bg-gray-100 p-3 rounded mb-4 border-l-4 border-black">
                  <div className="font-semibold">🎯 Today's Target:</div>
                  <div>
                    {target.reps} reps @ {formatWeight(target.weight)}
                  </div>
                  <button
                    onClick={() => handleTargetReached(idx, exercise)}
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

                {/* Remove confirmation modal */}
                {confirmRemove === idx && (
                  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white border-2 border-black p-6 rounded-md shadow-lg max-w-sm w-full">
                      <p className="mb-4 text-lg">Do you really want to remove this exercise?</p>
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
          })
        )}
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
                  placeholder="e.g., pull-up, lateral raise"
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
                  placeholder="e.g., 8"
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
