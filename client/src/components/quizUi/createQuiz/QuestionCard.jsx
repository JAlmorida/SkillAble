import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Trash2 } from 'lucide-react'

const QuestionCard = ({ question, deleteQuestionHandler }) => {
    return (
        <Card className="bg-gray-100 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl shadow transition-shadow hover:shadow-lg w-full">
            <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="question" className="border-none">
                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">{question.questionText}</span>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent>
                        <div className="px-6 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {question.options.map((option, index) => (
                                    <div 
                                        key={option._id || index}
                                        className={`rounded-lg py-2 px-3 text-base border transition-colors
                                            ${option.isCorrect
                                                ? "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200"
                                                : "border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-slate-200"
                                            }`}
                                    >
                                        {option.text}
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-end mt-4">
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteQuestionHandler(question)}
                                    className="flex items-center gap-2"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            </Accordion>
        </Card>
    )
}

export default QuestionCard