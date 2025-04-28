import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';

export default function TimeTableDisplayTeacher({ timetable }) {
  const [expandedDay, setExpandedDay] = useState(null);

  const toggleDay = (day) => {
    setExpandedDay(expandedDay === day ? null : day);
  };

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const sortedSchedule = Object.entries(timetable.schedule)
    .sort(([dayA], [dayB]) => daysOrder.indexOf(dayA) - daysOrder.indexOf(dayB));

  return (
    <div className="min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-8 text-blue-800">
          Weekly Timetable for {timetable.teacherName}
        </h2>
        <div className="space-y-4">
          {sortedSchedule.map(([day, classes]) => (
            <div key={day} className="bg-white border border-blue-200 rounded-md shadow-sm overflow-hidden">
              <button
                onClick={() => toggleDay(day)}
                className="w-full px-4 py-3 flex justify-between items-center bg-blue-100 hover:bg-blue-200 transition-colors duration-200"
              >
                <h3 className="text-lg font-medium text-blue-700">{day}</h3>
                {expandedDay === day ? (
                  <ChevronUpIcon className="h-5 w-5 text-blue-600" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-blue-600" />
                )}
              </button>
              {expandedDay === day && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-blue-50">
                        <th className="px-4 py-2 text-center text-xs font-medium text-blue-700 uppercase tracking-wider border-r border-blue-200">Time</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-blue-700 uppercase tracking-wider border-r border-blue-200">Subject</th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-blue-700 uppercase tracking-wider">Classroom</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {classes.map((classInfo, index) => (
                        <tr key={`${day}-${index}`} className="hover:bg-blue-50 transition-colors duration-200">
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600 border-r border-blue-100">{classInfo.time}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-800 border-r border-blue-100">{classInfo.subject}</td>
                          <td className="px-4 py-2 whitespace-nowrap text-sm text-blue-600">{classInfo.classroom}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}