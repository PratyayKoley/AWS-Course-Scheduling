import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

export default function Component() {
    const [selectedUser, setSelectedUser] = useState(null)
    const navigate = useNavigate()

    const handleCardClick = (userType) => {
        setSelectedUser(userType)

        // Navigate to different pages based on user type
        if (userType === 'student') {
            navigate('/studentPage')
        } else if (userType === 'admin') {
            navigate('/adminPage')
        } else if (userType === 'teacher') {
            navigate('/teacherPage')
        }
    }

    const userTypes = [
        { type: 'student', title: 'Student User', description: 'Access student features and resources', icon: '👨‍🎓', color: 'bg-blue-500' },
        { type: 'admin', title: 'Admin User', description: 'Manage system and user accounts', icon: '🛡️', color: 'bg-pink-500' },
        { type: 'teacher', title: 'Teacher User', description: 'Access teacher features and resources', icon: '👩‍🏫', color: 'bg-green-500' },
    ]

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 p-5">
            <div className="w-full max-w-4xl bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-lg p-8">
                <h1 className="text-3xl font-bold text-center text-white mb-2">Select User Type</h1>
                <p className="text-center text-white text-opacity-70 mb-8">Choose your role to access specific features</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {userTypes.map((user) => (
                        <button
                            key={user.type}
                            className={`h-full p-6 flex flex-col items-center justify-center space-y-4 rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-lg focus:outline-none ${selectedUser === user.type ? 'ring-2 ring-white' : ''
                                } ${user.color} bg-opacity-80 hover:bg-opacity-100`}
                            onClick={() => handleCardClick(user.type)}
                        >
                            <div className="text-4xl">{user.icon}</div>
                            <div className="text-center">
                                <h2 className="text-xl font-semibold text-white">{user.title}</h2>
                                <p className="text-sm text-white text-opacity-70 mt-2">{user.description}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
            <Link to="https://coursepscheduling.streamlit.app/" target='_blank'>
                <button
                    className="mt-8 px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 text-white font-semibold rounded-full transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 flex items-center gap-2"
                >
                    <MessageCircle className="w-5 h-5" />
                    <span>Chat with your syllabus AI</span>
                </button>
            </Link>
            {selectedUser && (
                <p className="mt-8 text-white text-xl font-semibold animate-fadeIn">
                    You selected: {selectedUser.charAt(0).toUpperCase() + selectedUser.slice(1)} user
                </p>
            )}
            <style>
                {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.5s ease-in-out;
          }
        `}
            </style>
        </div>
    )
}