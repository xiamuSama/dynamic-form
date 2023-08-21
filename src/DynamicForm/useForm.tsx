import { useContext, useRef } from 'react';
import context from './context';
import { IUseForm } from './types';

const useForm: IUseForm = () => {
    const currentRef = useRef<any>();
    const { formRef } = useContext(context);
    if (formRef) {
        currentRef.current = formRef;
    }
    return [currentRef.current];
};

export default useForm;
