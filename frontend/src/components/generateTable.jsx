import { useEffect, useState } from 'react'
import { FileSpreadsheet, FileDown } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export default function GenerateTable() {
  const [timetable, setTimetable] = useState(null)

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_LINK}/api/timetable/generate`)
      .then((res) => res.json())
      .then((data) => setTimetable(data))
      .catch((err) => console.error(err))
  }, [])

  const downloadCSV = (semester) => {
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    const slotTimings = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-13:30', '13:30-14:30', '14:30-15:30']
    
    let csvContent = `Day,${slotTimings.join(',')}\n`
    
    timetable[semester].forEach((day, index) => {
      const processedDay = processSlots(day)
      const rowData = processedDay.map(slot => {
        if (slot?.isBreak) return 'Break'
        if (!slot) return 'Free'
        return `${slot.subjectName} - ${slot.teacher} (${slot.classroom})`
      })
      csvContent += `${daysOfWeek[index]},${rowData.join(',')}\n`
    })

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `timetable_semester_${semester}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const downloadPDF = async (semester) => {
    const element = document.getElementById(`timetable-${semester}`)
    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('l', 'mm', 'a4') // landscape orientation
    const imgProps = pdf.getImageProperties(imgData)
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`timetable_semester_${semester}.pdf`)
  }

  if (!timetable) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-purple-400 via-pink-500 to-red-500">
      <div className="bg-white p-8 rounded-lg shadow-2xl">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto"></div>
        <p className="text-gray-700 font-semibold mt-4">Loading timetable...</p>
      </div>
    </div>
  )

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
  const slotTimings = ['9:00-10:00', '10:00-11:00', '11:00-12:00', '12:00-13:00', '13:00-13:30', '13:30-14:30', '14:30-15:30']

  const processSlots = (day) => {
    const processedSlots = []
    for (let i = 0; i < slotTimings.length; i++) {
      if (i === 4) {
        processedSlots.push({ isBreak: true })
      } else if (i > 4) {
        processedSlots.push(day[i - 1])
      } else {
        processedSlots.push(day[i])
      }
    }
    return processedSlots
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-8">
      <h1 className="text-5xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-12">
        Timetable Generator
      </h1>

      {Object.keys(timetable).map((semester) => (
        <div key={semester} className="mb-12 bg-white rounded-2xl shadow-xl overflow-hidden transition duration-300 ease-in-out transform hover:scale-102">
          <div className="flex justify-between items-center p-6 bg-gradient-to-r from-purple-500 to-pink-500">
            <h2 className="text-3xl font-bold text-white">
              Semester {semester}
            </h2>
            <div className="flex gap-3">
              <button
                onClick={() => downloadCSV(semester)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition duration-200 shadow-md"
              >
                <FileSpreadsheet size={20} />
                <span>CSV</span>
              </button>
              <button
                onClick={() => downloadPDF(semester)}
                className="flex items-center gap-2 px-4 py-2 bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition duration-200 shadow-md"
              >
                <FileDown size={20} />
                <span>PDF</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto" id={`timetable-${semester}`}>
            <table className="w-full border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="py-4 px-6 text-center text-gray-600 font-semibold border-b border-r border-gray-200">Day</th>
                  {slotTimings.map((time, i) => (
                    <th key={i} className="py-4 px-6 text-center text-gray-600 font-semibold border-b border-r border-gray-200 last:border-r-0">
                      {time}
                      {i === 4 && <span className="block text-xs text-purple-500">(Break)</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timetable[semester].map((day, dayIndex) => (
                  <tr key={dayIndex} className="border-t border-gray-200 hover:bg-gray-50 transition duration-150 ease-in-out">
                    <td className="py-4 px-6 font-medium text-gray-800 border-r border-gray-200">{daysOfWeek[dayIndex]}</td>
                    {processSlots(day).map((slot, slotIndex) => (
                      <td
                        key={slotIndex}
                        className={`py-4 px-6 text-center border-r border-gray-200 last:border-r-0 ${
                          slot?.isBreak ? 'bg-purple-100' : ''
                        }`}
                      >
                        {slot?.isBreak ? (
                          <span className="text-purple-600 font-medium">Break</span>
                        ) : slot ? (
                          <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-2 rounded-lg shadow-sm">
                            <p className="font-medium text-gray-800">{slot.subjectName}</p>
                            <p className="text-sm text-gray-600">{slot.teacher}</p>
                            <p className="text-xs text-gray-500">{slot.classroom}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Free</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  )
}