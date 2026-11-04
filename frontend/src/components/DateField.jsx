import React, { forwardRef } from 'react';
import { CalendarDays } from 'lucide-react';
import Input from './Input';

const DateField = forwardRef(function DateField({ className = '', type = 'date', ...props }, ref) {
  return <span className={`hg-date-field ${className}`.trim()}>
    <CalendarDays size={15} aria-hidden="true" />
    <Input ref={ref} type={type} {...props} />
  </span>;
});

export default DateField;
