import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Upload, FileText, Users, BookOpen, School } from 'lucide-react';

export default function AdminPanel() {
    const [files, setFiles] = useState({
        teachers: null,
        classrooms: null,
        students: null,
        subjects: null
    });

    const handleFileUpload = (e, type) => {
        setFiles(prev => ({ ...prev, [type]: e.target.files[0] }));
    };

    const handleUpload = async (type) => {
        if (!files[type]) {
            alert('Please select a file first!');
            return;
        }

        const formData = new FormData();
        formData.append('file', files[type]);

        try {
            const response = await fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/${type}/upload-${type}`, {
                method: 'POST',
                body: formData,
            });
            const data = await response.json();
            if (response.ok) {
                alert(`${type.charAt(0).toUpperCase() + type.slice(1)} file uploaded and processed successfully!`);
                setFiles(prev => ({ ...prev, [type]: null }));
            } else {
                throw new Error(data.message || 'Upload failed');
            }
        } catch (error) {
            console.error(`Error uploading ${type} file:`, error);
            alert(`Error uploading ${type} file: ${error.message}`);
        }
    };

    const uploadSections = [
        { type: 'teachers', title: 'Upload Teachers CSV', icon: Users },
        { type: 'classrooms', title: 'Upload Classrooms CSV', icon: School },
        { type: 'students', title: 'Upload Students CSV', icon: FileText },
        { type: 'subjects', title: 'Upload Subjects CSV', icon: BookOpen },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-100 to-pink-200 p-6">
            <nav className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-lg mb-8 shadow-lg">
                <ul className="flex justify-center space-x-8">
                    {['Generate Timetable', 'Student Data', 'View Data'].map((item, index) => (
                        <Link key={index} to={`/${item.toLowerCase().replace(' ', '')}`}>
                            <li className="text-white text-lg cursor-pointer hover:underline hover:text-yellow-200 transition-all duration-300">
                                {item}
                            </li>
                        </Link>
                    ))}
                </ul>
            </nav>

            <h2 className="text-4xl text-center text-gray-700 mb-12 font-extrabold tracking-wide">
                Admin Panel
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
                {uploadSections.map(({ type, title, icon: Icon }) => (
                    <div key={type} className="bg-white p-8 rounded-xl shadow-xl transform hover:scale-105 transition-transform duration-300">
                        <h3 className="text-2xl text-gray-700 mb-6 font-bold flex items-center">
                            <Icon className="mr-2" size={24} />
                            {title}
                        </h3>
                        <input
                            type="file"
                            accept=".csv"
                            onChange={(e) => handleFileUpload(e, type)}
                            className="mb-6 w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                        />
                        <button
                            onClick={() => handleUpload(type)}
                            disabled={!files[type]}
                            className={`w-full py-3 text-white rounded-lg font-bold tracking-wider shadow-lg flex items-center justify-center ${
                                files[type]
                                    ? 'bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300'
                                    : 'bg-gray-300 cursor-not-allowed'
                            }`}
                        >
                            <Upload className="mr-2" size={20} />
                            Upload {type.charAt(0).toUpperCase() + type.slice(1)}
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}