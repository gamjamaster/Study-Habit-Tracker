"use client"; // declare this as a client component in Next.js

import { useState, useEffect, useCallback } from "react"; // import React hooks for state and effect management
import SubjectForm from "@/components/SubjectForm"; // import the subject creation form component
import { useAuth } from "@/contexts/AuthContext"; // import authentication context
import ProtectedRoute from "@/components/ProtectedRoute"; // import protected route component
import { API_ENDPOINTS } from "@/lib/api"; // import API endpoints
// Removed unused icons to satisfy lint rules

// define TypeScript interface for subject data structure
interface Subject {
    id: number; // unique identifier for each subject
    name: string; // name of the subject
    color: string; // color code for the subject
    created_at: string; // timestamp when the subject was created
}

// main content component for the subjects page
function SubjectsContent() {
    const { user, session } = useAuth(); // get authentication state
    // state hook to store the list of subjects, initialized as empty array with Subject type
    const [subjects, setSubjects] = useState<Subject[]>([]);
    // state hook to manage loading state while making API requests
    const [loading, setLoading] = useState(true);
    // state hook to store error messages, can be string or null
    const [error, setError] = useState<string | null>(null);
    // state hook to control whether the subject creation form is visible
    const [showForm, setShowForm] = useState(false);
    // state hook to track which subject is being edited
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

    // async function to fetch the list of subjects from the backend API
    const fetchSubjects = useCallback(async () => {
        // check authentication before making API calls
        if (!session) {
            setLoading(false);
            return;
        }

        try { // try block to handle potential errors
            setLoading(true); // set loading state to true when starting the API request
            // make GET request to the backend subjects endpoint with JWT token
            const response = await fetch(API_ENDPOINTS.SUBJECTS, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, // add JWT token
                    'Content-Type': 'application/json'
                }
            });
            // check if the HTTP response status is not ok (not 200-299 range)
            if (!response.ok) {
                // throw an error if the response is not successful
                throw new Error("Cannot load the subject list.");
            }
            // parse the JSON response data
            const data = await response.json();
            // update the subjects state with the fetched data
            setSubjects(data);
            // clear any previous error messages
            setError(null);
        } catch (err) { // catch block to handle any errors that occur
            // set error message, checking if err is an Error instance for type safety
            setError(err instanceof Error ? err.message : "An unknown error has occurred.");
        } finally { // finally block runs regardless of success or failure
            setLoading(false); // set loading state to false when request completes
        }
    }, [session]); // dependency array for useCallback

    // useEffect hook to run code when component mounts (loads for the first time)
    useEffect(() => {
        if (user && session) {
            fetchSubjects(); // call function to fetch subjects from backend
        }
    }, [user, session, fetchSubjects]); // dependency array includes user, session, and fetchSubjects

    // async function to delete a subject by its ID
    const deleteSubject = async (subjectId: number) => {
        // show browser confirmation dialog to user before deleting
        if (!confirm("Are you sure you want to delete this subject?")) {
            return; // exit function if user cancels
        }

        // check authentication before making API calls
        if (!session) {
            alert("Please log in to delete subjects.");
            return;
        }

        try { // try block for error handling
            // make DELETE request to backend with the subject ID in URL and JWT token
            const response = await fetch(API_ENDPOINTS.subjectById(subjectId), {
                method: "DELETE", // specify HTTP DELETE method
                headers: {
                    'Authorization': `Bearer ${session.access_token}`, // add JWT token
                    'Content-Type': 'application/json'
                }
            });

            // check if the delete request was not successful
            if (!response.ok) {
                // throw error if deletion failed
                throw new Error("Failed to delete the subject");
            }

            // refresh the subjects list after successful deletion
            await fetchSubjects();
            // show success message to user
            alert("Subject deleted successfully!");
        } catch (err) { // catch any errors during deletion
            // set error message with type checking
            setError(err instanceof Error ? err.message : "Error occurred while deleting subject");
        }
    };

    // callback function called when a new subject is successfully created
    const handleSubjectAdded = () => {
        fetchSubjects(); // refresh the subjects list to include new subject
        setShowForm(false); // hide the subject creation form
        setEditingSubject(null); // clear editing state
    };

    // callback function called when a subject is successfully updated
    const handleSubjectUpdated = () => {
        fetchSubjects(); // refresh the subjects list to show updated subject
        setShowForm(false); // hide the form
        setEditingSubject(null); // clear editing state
    };

    // function to handle edit button click
    const handleEditSubject = (subject: Subject) => {
        setEditingSubject(subject); // set the subject being edited
        setShowForm(true); // show the form
    };

    // function to handle cancel edit
    const handleCancelEdit = () => {
        setEditingSubject(null); // clear editing state
        setShowForm(false); // hide the form
    };

    // utility function to format date string into readable format
    const formatDate = (dateString: string) => {
        // convert ISO date string to localized Korean format
        return new Date(dateString).toLocaleDateString("ko-KR", {
            year: "numeric", // display year as number
            month: "short", // display month in short format (e.g., "Jan")
            day: "numeric", // display day as number
        });
    };

    // conditional rendering: show loading message if data is still being fetched
    if (loading) return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );

    // main JSX return statement for rendering the page
    return (
        // main container with full screen height, light gray background, and responsive padding
        <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:-ml-60 lg:pl-60">
            {/* centered container with maximum width and auto horizontal margins */}
            <div className="max-w-4xl mx-auto px-4 sm:px-6">
                
                {/* page header section with title and add button - responsive layout */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 sm:mb-8">
                    {/* left side of header with title and description */}
                    <div>
                        {/* main page title with responsive font size and bold weight */}
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Subject Management</h1>
                        {/* subtitle description with smaller gray text */}
                        <p className="text-sm sm:text-base text-gray-600 mt-1 sm:mt-2">Add and manage your subjects</p>
                    </div>
                    {/* button to toggle subject creation form visibility */}
                    <button
                        onClick={() => {
                            setEditingSubject(null); // clear editing state
                            setShowForm(!showForm); // toggle showForm state when clicked
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-colors w-full sm:w-auto"
                    >
                        {/* conditional text based on form visibility state */}
                        {showForm ? "Cancel" : "Add New Subject"}
                    </button>
                </div>

                {/* conditional rendering: show error message only if error exists */}
                {error && (
                    // error message container with red styling
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
                        {error} {/* display the error message */}
                    </div>
                )}

                {/* conditional rendering: show subject creation form only if showForm is true */}
                {showForm && (
                    // form container with white background, rounded corners, and shadow
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                        {/* form section title */}
                        <h2 className="text-xl font-semibold mb-4">
                            {editingSubject ? "Edit Subject" : "Add New Subject"}
                        </h2>
                        {/* render the SubjectForm component with appropriate props */}
                        <SubjectForm
                            onCreated={handleSubjectAdded}
                            onUpdated={handleSubjectUpdated}
                            editSubject={editingSubject}
                            onCancel={handleCancelEdit}
                            token={session?.access_token}
                        />
                    </div>
                )}

                {/* statistics section showing subject information */}
                <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    {/* statistics section title */}
                    <h2 className="text-xl font-semibold mb-4">Subject Statistics</h2>
                    {/* responsive grid layout: 1 column on mobile, 3 columns on medium screens and up */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        
                        {/* total subjects count card */}
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            {/* large number showing total subject count */}
                            <p className="text-2xl font-bold text-blue-600">{subjects.length}</p>
                            {/* label for the statistic */}
                            <p className="text-gray-600">Total Subjects</p>
                        </div>
                        
                        {/* subjects added this week card */}
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            {/* calculate and display subjects created in the last 7 days */}
                            <p className="text-2xl font-bold text-green-600">
                                {subjects.filter(subject => 
                                    // filter subjects created within the last 7 days (7 * 24 * 60 * 60 * 1000 milliseconds)
                                    new Date(subject.created_at).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
                                ).length} {/* get the count of filtered subjects */}
                            </p>
                            {/* label for this week's additions */}
                            <p className="text-gray-600">Added This Week</p>
                        </div>
                        
                        {/* unique colors used card */}
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            {/* count unique colors by creating Set from color array to remove duplicates */}
                            <p className="text-2xl font-bold text-purple-600">
                                {new Set(subjects.map(s => s.color)).size} {/* Set automatically removes duplicates, size gives count */}
                            </p>
                            {/* label for colors used */}
                            <p className="text-gray-600">Colors Used</p>
                        </div>
                    </div>
                </div>

                {/* subjects list section */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                    {/* subjects list title */}
                    <h2 className="text-xl font-semibold mb-6">Subjects List</h2>
                    
                    {/* conditional rendering: show empty state or subjects list */}
                    {subjects.length === 0 ? (
                        // empty state when no subjects exist
                        <div className="text-center py-12">
                            {/* empty state icon container */}
                            <div className="text-gray-400 mb-4">
                                {/* SVG icon for empty state */}
                                <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                                </svg>
                            </div>
                            {/* empty state message */}
                            <p className="text-gray-500 text-lg">No subjects registered</p>
                            {/* instruction text for user */}
                            <p className="text-gray-400 mt-2">Click &ldquo;Add New Subject&rdquo; button above to add your first subject</p>
                        </div>
                    ) : (
                        // grid layout for displaying subject cards when subjects exist
                        // responsive: 1 column on mobile, 2 on tablet, 3 on desktop
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* map through subjects array to create a card for each subject */}
                            {subjects.map((subject) => (
                                // individual subject card with unique key, border, and hover effects
                                <div key={subject.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                                    
                                    {/* subject header with color indicator and name */}
                                    <div className="flex items-center justify-between mb-3">
                                        {/* left side: color circle and subject name */}
                                        <div className="flex items-center space-x-3">
                                            {/* color indicator circle with dynamic background color */}
                                            <div
                                                className="w-6 h-6 rounded-full border-2 border-gray-300"
                                                style={{ backgroundColor: subject.color }} // inline style for dynamic color
                                            />
                                            {/* subject name with bold styling */}
                                            <h3 className="font-semibold text-lg text-gray-900">{subject.name}</h3>
                                        </div>
                                    </div>

                                    {/* subject creation date */}
                                    <p className="text-sm text-gray-600 mb-4">
                                        Created: {formatDate(subject.created_at)} {/* use formatDate function to display readable date */}
                                    </p>

                                    {/* action buttons section */}
                                    <div className="flex space-x-2">
                                        {/* delete button */}
                                        <button
                                            onClick={() => deleteSubject(subject.id)} // call deleteSubject function with subject ID
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 py-2 px-4 rounded-md font-medium transition-colors"
                                        >
                                            Delete {/* button text */}
                                        </button>
                                        {/* edit button (placeholder for future functionality) */}
                                        <button
                                            onClick={() => handleEditSubject(subject)}
                                            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-md font-medium transition-colors"
                                        >
                                            Edit {/* button text */}
                                        </button>
                                    </div>
                                </div>
                            ))} {/* end of subjects.map */}
                        </div>
                    )} {/* end of conditional rendering for subjects list */}
                </div> {/* end of subjects list section */}
            </div> {/* end of main container */}
        </div> // end of page container
    ); // end of return statement
} // end of SubjectsContent component function

// Main component with authentication protection
export default function SubjectsPage() {
    return (
        <ProtectedRoute>
            <SubjectsContent />
        </ProtectedRoute>
    );
}