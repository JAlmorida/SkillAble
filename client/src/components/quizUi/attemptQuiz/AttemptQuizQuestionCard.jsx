import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import React from 'react'

const AttemptQuizQuestionCard = React.memo(({ question, onAnswerChange }) => {
    const handleOptionChange = (value) => {
        onAnswerChange(question._id, value)
    }

    return (
        <Card className="w-full my-3 bg-slate-800 border-slate-600">
            <CardHeader className="border-b border-slate-600 pb-3">
                <CardTitle>{question.questionText}</CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
                <RadioGroup
                onValueChange={handleOptionChange}
                className="flex flex-col md:flex-row justify-evenly gap-5"
                >
                {question.options.map((option) => (
                    <div key={option._id} className=" flex items-center space-x-2">
                        <RadioGroupItem value={option._id} id={option._id}/>
                        <Label
                        htmlFor={option._id}
                        className="cursor-pointer"
                        >
                            {option.text}
                        </Label>
                    </div>
                ))}

                </RadioGroup>
            </CardContent>
        </Card>
    )

})


export default AttemptQuizQuestionCard