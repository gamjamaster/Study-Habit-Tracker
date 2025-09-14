'use client'

import {useAuth} from '@/contexts/AuthContext'
import {useRouter} from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps{
    children: React.ReactNode
}

export default function ProtectedRoute({ children}: ProtectedRouteProps){
    const {user, loading} = useAuth() // load user id and loading state from the auth context
    const router = useRouter()

    useEffect(() => {
        // redirects to the login page
        if(!loading && !user){
            router.push('/auth/login')
        }
    }, [user,loading,router])

    // show loading screen when loading
    if(loading){
        return(
            <div className = "flex items-center justify-center min-h-screen">
                <div className = "text-lg text-gray-600">Loading...</div>    
            </div>
        )
    }

    // return NULL if no user exists
    if(!user){
        return null
    }

    // children rendering only for authenticated users
    return <>{children}</>
}