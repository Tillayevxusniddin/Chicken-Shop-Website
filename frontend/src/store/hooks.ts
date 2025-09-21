// src/store/hooks.ts
import { useDispatch, useSelector } from 'react-redux';
import type { TypedUseSelectorHook } from 'react-redux';
import type { RootState, AppDispatch } from './index';

// Standard useDispatch o'rniga buni ishlatamiz
export const useAppDispatch = () => useDispatch<AppDispatch>();

// Standard useSelector o'rniga buni ishlatamiz
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
