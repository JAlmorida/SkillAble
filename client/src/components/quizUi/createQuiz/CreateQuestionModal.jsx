import { useCreateQuestionMutation } from '@/features/api/questionApi';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'sonner';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useParams } from "react-router-dom";
import { Label } from '@/components/ui/label';
import Input from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';

const CreateQuestionModal = ({ setQuestions, setCreateQuestionModalData }) => {
    const [options, setOptions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [currentOption, setCurrentOption] = useState('');
    const [isCurrentOptionCorrect, setIsCurrentOptionCorrect] = useState(false);
    const [optionError, setOptionError] = useState('');
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { token } = useSelector(state => state.auth);
    const { quizId } = useParams();

    const [createQuestion] = useCreateQuestionMutation();

    const submitHandler = async (data) => {
        if (!options.some(option => option.isCorrect)) {
            setOptionError("There must be at least one correct option.");
            return;
        }
        setLoading(true);
        const payload = {
            ...data,
            options,
            quizId
        };
        try {
            const response = await createQuestion({
                data: payload,
                token
            }).unwrap();
            if (response) {
                setQuestions(prevQuestions => [...prevQuestions, response]);
                setCreateQuestionModalData(null);
                reset();
            }
        } catch (error) {
            toast.error("Question cannot be created");
        } finally {
            setLoading(false);
        }
    };

    const addOption = () => {
        if (!currentOption.trim()) return;
        if (isCurrentOptionCorrect && options.some(option => option.isCorrect)) {
            setOptionError("There can be only one correct option.");
            return;
        }
        setOptions([...options, { text: currentOption, isCorrect: isCurrentOptionCorrect }]);
        if (isCurrentOptionCorrect) setOptionError("");
        setCurrentOption('');
        setIsCurrentOptionCorrect(false);
    };

    const removeOption = (index) => {
        setOptions(options.filter((_, i) => i !== index));
    };

    return (
        <>
            <div 
                className="fixed inset-0 bg-black/50 z-40"
                onClick={() => setCreateQuestionModalData(null)}
            />
            
            <div className="fixed top-1/2 left-1/2 max-w-[480px] w-full -translate-x-1/2 -translate-y-1/2 flex flex-col items-center bg-background shadow-lg rounded-lg border p-5 z-50 max-h-[90vh] overflow-y-auto">
                <h3 className="text-3xl mb-2">Create A Question</h3>
                <form onSubmit={handleSubmit(submitHandler)} className="w-full">
                    <div className="flex flex-col gap-3">
                        <Label htmlFor="questionText">Enter Question</Label>
                        <Input
                            id="questionText"
                            placeholder="Enter Question Here"
                            {...register("questionText", { required: "Question is required" })}
                        />
                        {errors.questionText && <p className="text-red-500">{errors.questionText.message}</p>}
                    </div>

                    <div className="flex flex-col gap-3">
                        <Label>Add Options</Label>
                        <div className="flex flex-col gap-2">
                            <div className="gap-2 flex">
                                <Input
                                    placeholder="Create Option"
                                    value={currentOption}
                                    onChange={e => setCurrentOption(e.target.value)}
                                    className="flex-1"
                                />
                                <Checkbox
                                    id="isCorrect"
                                    checked={isCurrentOptionCorrect}
                                    onCheckedChange={checked => setIsCurrentOptionCorrect(!!checked)}
                                />
                                <Label htmlFor="isCorrect" className="ml-2">Correct?</Label>
                                <Button type="button" size="icon" onClick={addOption} variant="secondary">
                                    <Plus size={18} />
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        {options.map((option, index) => (
                            <div key={index} className="flex gap-2 items-center">
                                <span>{option.text}</span>
                                {option.isCorrect && <span className="text-green-500 text-xs">(Correct)</span>}
                                <Button
                                    type="button"
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => removeOption(index)}
                                    className="text-red-500"
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        ))}
                    </div>
                    {optionError && <p className="text-red-500">{optionError}</p>}

                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setCreateQuestionModalData(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating..." : "Create"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateQuestionModal;