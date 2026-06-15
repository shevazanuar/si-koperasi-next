"use client";

import { useState, useEffect } from "react";

/**
 * CurrencyInput component for handling Indonesian Rupiah (IDR) formatting
 * Displays numbers with dot separators (e.g., 1.000.000)
 * Submits raw integer values (e.g., 1000000) via a hidden input for form submission
 */
export default function CurrencyInput({
  name,
  defaultValue = "",
  placeholder = "0",
  className = "",
  required = false,
  onChange,
  value,
  ...props
}) {
  const formatRupiah = (value) => {
    if (!value && value !== 0) return "";
    const numberString = value.toString().replace(/[^,\d]/g, "");
    return new Intl.NumberFormat("id-ID").format(numberString);
  };

  const [displayValue, setDisplayValue] = useState(() => {
    const val = value !== undefined ? value : defaultValue;
    return val !== "" && val !== null && val !== undefined ? formatRupiah(val) : "";
  });
  
  const [rawValue, setRawValue] = useState(() => {
    const val = value !== undefined ? value : defaultValue;
    return val !== "" && val !== null && val !== undefined ? val.toString() : "";
  });

  // Initialize or update value when props change
  useEffect(() => {
    const valToUse = value !== undefined ? value : defaultValue;
    if (valToUse !== "" && valToUse !== null && valToUse !== undefined) {
      setRawValue(valToUse.toString());
      setDisplayValue(formatRupiah(valToUse));
    } else {
      setRawValue("");
      setDisplayValue("");
    }
  }, [defaultValue, value]);

  const handleChange = (e) => {
    // Strip all non-digit characters
    let rawStr = e.target.value.replace(/\D/g, "");
    
    // Remove leading zeros
    if (rawStr.length > 1 && rawStr.startsWith("0")) {
      rawStr = rawStr.replace(/^0+/, "");
      // if it was "0000", keep at least one "0"
      if (rawStr === "") rawStr = "0";
    }

    setRawValue(rawStr);
    setDisplayValue(formatRupiah(rawStr));

    if (onChange) {
      onChange(rawStr); // Pass raw value to parent if needed
    }
  };

  return (
    <>
      <input
        type="hidden"
        name={name}
        value={rawValue}
      />
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={className}
        required={required}
        {...props}
      />
    </>
  );
}
