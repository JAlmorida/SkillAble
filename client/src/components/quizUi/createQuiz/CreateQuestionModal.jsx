import { useCreateQuestionMutation } from '@/features/api/questionApi';
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { Plus, X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useParams } from "react-router-dom";
import { Label } from '@/components/ui/label';
import Input from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const MIN_OPTIONS = 2;

const CreateQuestionModal = ({ setQuestions, setCreateQuestionModalData }) => {
    const [options, setOptions] = useState([]);
    const [currentOption, setCurrentOption] = useState('');
    const [formError, setFormError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, formState: { errors }, reset, setFocus } = useForm();
    const { token } = useSelector(state => state.auth);
    const { quizId } = useParams();
    const [createQuestion] = useCreateQuestionMutation();
    const inputRef = useRef(null);

    // Focus the question input on open
    useEffect(() => {
        setFocus('questionText');
    }, [setFocus]);

    // Close modal on ESC
    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setCreateQuestionModalData(null);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setCreateQuestionModalData]);

    // Add option on Enter
    const handleOptionKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addOption();
        }
    };

    const addOption = () => {
        const trimmed = currentOption.trim();
        if (!trimmed) return;
        setOptions(prev => [...prev, { text: trimmed, isCorrect: false }]);
        setCurrentOption('');
        setFormError('');
        inputRef.current?.focus();
    };

    const removeOption = (idx) => {
        setOptions(prev => prev.filter((_, i) => i !== idx));
    };

    const toggleCorrect = (idx) => {
        setOptions(prev => prev.map((opt, i) => i === idx ? { ...opt, isCorrect: !opt.isCorrect } : opt));
    };

    const validateForm = (data) => {
        if (!data.questionText.trim()) {
            setFormError('Question is required.');
            return false;
        }
        if (options.length < MIN_OPTIONS) {
            setFormError('At least two options are required.');
            return false;
        }
        if (!options.some(opt => opt.isCorrect)) {
            setFormError('At least one correct answer is required.');
            return false;
        }
        setFormError('');
        return true;
    };

    const submitHandler = async (data) => {
        if (!validateForm(data)) return;
        setLoading(true);
        const payload = {
            ...data,
            options,
            quizId
        };
        try {
            const response = await createQuestion({ data: payload, token }).unwrap();
            if (response) {
                setQuestions(prevQuestions => [...prevQuestions, response]);
                setCreateQuestionModalData(null);
                reset();
                setOptions([]);
                toast.success('Question created!');
            }
        } catch {
            toast.error('Question cannot be created');
        } finally {
            setLoading(false);
        }
    };

    // Modal backdrop click closes modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) setCreateQuestionModalData(null);
    };

    return (
        <div 
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/50" 
            onClick={handleBackdropClick}
            tabIndex={-1}
        >
            <div
                className="relative bg-background shadow-lg rounded-lg border p-6 w-full max-w-md mx-auto z-50 max-h-[90vh] overflow-y-auto"
                role="dialog"
                aria-modal="true"
                aria-labelledby="dialog-title"
                aria-describedby="dialog-description"
            >
                <button
                    className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                    onClick={() => setCreateQuestionModalData(null)}
                    aria-label="Close"
                >
                    <X size={22} />
                </button>
                <h3 id="dialog-title" className="text-2xl mb-4 font-semibold">Create a Question</h3>
                <p id="dialog-description" className="sr-only">Create a new question for this quiz</p>
                <form onSubmit={handleSubmit(submitHandler)} className="space-y-5">
                    <div>
                        <Label htmlFor="questionText">Question</Label>
                        <Input
                            id="questionText"
                            placeholder="Enter question here"
                            {...register("questionText", { required: true })}
                            autoFocus
                        />
                        {errors.questionText && <p className="text-red-500 text-sm mt-1">Question is required.</p>}
                    </div>
                    <div>
                        <Label htmlFor="optionInput">Options</Label>
                        <div className="flex gap-2 mt-2">
                            <Input
                                id="optionInput"
                                ref={inputRef}
                                placeholder="Add option"
                                value={currentOption}
                                onChange={e => setCurrentOption(e.target.value)}
                                onKeyDown={handleOptionKeyDown}
                                className="flex-1"
                            />
                            <Button type="button" size="icon" onClick={addOption} variant="secondary" aria-label="Add option">
                                <Plus size={18} />
                            </Button>
                        </div>
                        <div className="mt-3 space-y-2">
                            {options.map((option, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded px-2 py-1">
                                    <input
                                        type="checkbox"
                                        checked={option.isCorrect}
                                        onChange={() => toggleCorrect(idx)}
                                        id={`correct-${idx}`}
                                    />
                                    <Label htmlFor={`correct-${idx}`} className="flex-1 cursor-pointer">
                                        {option.text}
                                    </Label>
                                    <Button
                                        type="button"
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => removeOption(idx)}
                                        aria-label="Remove option"
                                        className="text-red-500"
                                    >
                                        <X size={16} />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                    {formError && <p className="text-red-500 text-sm">{formError}</p>}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="outline" onClick={() => setCreateQuestionModalData(null)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading || !options.length} className="flex items-center gap-2">
                            {loading && <Loader2 className="animate-spin h-4 w-4" />} Create
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateQuestionModal;