"use client";

import {useState, useEffect} from "react";
import  {useAuth} from "@/contexts/AuthContext";
import {useRouter} from "next/navigation";
import { 
  UserCircleIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowLeftIcon
} from "@heroicons/react/24/outline";

export default function ProfilePage(){
    const {user, updateProfile, updateEmail} = useAuth();
    const router = useRouter();

    // form state management
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({type: "", text: ""});

    // load the user data when mounting the component
    useEffect(() => {
        if(user){
            setFullName(user.user_metadata?.full_name || "");
            setEmail(user.email || "");
        }
    }, [user]);

    // redirect users without authentication
    useEffect(() => {
        if(!user){
            router.push("/auth/login");
        }
    }, [user, router]);

    // function to update name
    const handleUpdateName = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({type: "", text: ""});

        try{
            const {error} = await updateProfile({full_name: fullName});

            if(error){
                setMessage({type: "error", text: error.message});
            } else{
                setMessage({type: "success", text: "Name has been updated successfully."});
            }
        } catch(error){
            setMessage({type: "error", text: "An error has occured while updating your name."});
        } finally{
            setIsLoading(false);
        }
    };

    // function to update email
    const handleUpdateEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({type: "", text: ""});

        try{
            const {error} = await updateEmail(email);

            if(error){
                setMessage({type: "error", text: error.message});
            } else{
                setMessage({
                    type: "success", text: "A confirmation link has been sent to your new email."});
            }
        } catch(error){
            setMessage({type: "error", text: "An error has occured while updating your email."});
        } finally{
            setIsLoading(false);
        }
    };

    if(!user){
        return(
            <div className = "min-h-screen bg-gray-50 flex items-center justify-center">
                <div className = "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return(
        <div className = "min-h-screen bg-gray-50 lg:ml-60">
            <div className = "p-6 lg:p-8">
                {/* header */}
                <div className = "mb-8">
                    <div className = "flex items-center gap-4 mb-4">
                        <button
                          onClick = {() => router.back()}
                          className = "p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >   
                          <ArrowLeftIcon className = "w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className = "text-3xl font-bold text-gray-900">Profile Settings</h1>
                            <p className="text-gray-600 mt-1">Manage your account information</p>
                        </div>
                    </div>
                </div>

                {/* Notification Message */}
                {message.text && (
                    <div className = {`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                        message.type === "success"
                          ? "bg-green-50 text-green-800 border border-green-200"
                          : "bg-red-50 text-red-800 border border-red-200"
                    }`}>
                      {message.type === "success" ? (
                        <CheckCircleIcon className="w-5 h-5 flex-shrink-0" />
            ) : (
              <ExclamationCircleIcon className="w-5 h-5 flex-shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="max-w-2xl">
          {/* 현재 사용자 정보 */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-100 rounded-full">
                <UserCircleIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Current Account Information</h2>
                <p className="text-gray-600">Information of the currently signed in account</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <p className="text-gray-900 font-medium">
                  {user.user_metadata?.full_name || "Undefined"}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of sign up</label>
                <p className="text-gray-900 font-medium">
                  {new Date(user.created_at).toLocaleDateString('ko-KR')}
                </p>
              </div>
            </div>
          </div>

          {/* name update form */}
          <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-green-100 rounded-full">
                <UserCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Update your name</h2>
                <p className="text-gray-600">Update your name to be displayed to other users</p>
              </div>
            </div>

            <form onSubmit={handleUpdateName} className="space-y-4">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || fullName === (user.user_metadata?.full_name || "")}
                className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? "Updating..." : "Name update"}
              </button>
            </form>
          </div>

          {/* email update form */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-purple-100 rounded-full">
                <EnvelopeIcon className="w-8 h-8 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Update your email</h2>
                <p className="text-gray-600">A revalidation link will be sent to your new email</p>
              </div>
            </div>

            <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <ExclamationCircleIcon className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Precautions when changing email:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>A revalidation link will be sent to your new email</li>
                    <li>You must log in with your existing email address until your email is verified</li>
                    <li>After verification, you can log in with the new email</li>
                  </ul>
                </div>
              </div>
            </div>

            <form onSubmit={handleUpdateEmail} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  New email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your new email address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || email === user.email}
                className="w-full sm:w-auto px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isLoading ? "Sending..." : "Email update"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}