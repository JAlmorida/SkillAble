import React from 'react'

const AttemptQuizQuestionCard = React.memo(
  ({ question, onAnswerChange, selectedOption }) => {
    const handleOptionChange = (value) => {
      onAnswerChange(question._id, value)
    }

    return (
      <div className="w-full my-6 p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-200 dark:border-slate-700 transition-all">
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {question.questionText}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === option._id
            return (
              <label
                key={option._id}
                htmlFor={option._id}
                className={`
                  flex items-center w-full px-6 py-3 cursor-pointer
                  transition-colors
                  ${isSelected
                    ? 'bg-blue-100 dark:bg-blue-600 text-blue-900 dark:text-white'
                    : 'bg-gray-100 dark:bg-slate-700 text-gray-900 dark:text-white'
                  }
                  hover:bg-blue-50 dark:hover:bg-slate-600
                `}
                style={{ minHeight: '56px' }}
              >
                <input
                  type="radio"
                  id={option._id}
                  name={question._id}
                  value={option._id}
                  checked={isSelected}
                  onChange={() => handleOptionChange(option._id)}
                  className="w-4 h-4 mr-4 accent-blue-600"
                />
                <span className="font-semibold mr-2">{String.fromCharCode(65 + idx)}.</span>
                <span className="flex-1">{option.text}</span>
              </label>
            )
          })}
        </div>
      </div>
    )
  }
)

export default AttemptQuizQuestionCard