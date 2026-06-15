"use client";
import React from 'react';
import CurrencyInput from './src/components/ui/CurrencyInput';

export default function TestPage() {
    return (
        <div style={{ padding: '50px' }}>
            <h1>Test Currency Input</h1>
            <CurrencyInput name="test_currency" placeholder="Ketik disini..." className="border p-2" />
        </div>
    );
}
