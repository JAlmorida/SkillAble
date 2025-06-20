import { createSlice } from "@reduxjs/toolkit"

const initialState = {
    quiz: null,
    edit: false,
};

const quizSlice = createSlice({
    name: "quiz",
    initialState,
    reducers: {
        setQuiz(state, action) {
            state.quiz = action.payload;
        },
        setEdit(state, action) {
            state.edit = action.payload;
        },
    },
});

export const { setQuiz, setEdit } = quizSlice.actions;
export default quizSlice.reducer; 