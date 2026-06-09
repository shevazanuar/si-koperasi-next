import { useEffect, useState, useRef } from 'react';

export default function CurrencyInput({ name, placeholder, required, className, value, onChange, readOnly }) {
  const [displayValue, setDisplayValue] = useState('');
  const [rawValue, setRawValue] = useState('');
  const hiddenInputRef = useRef(null);

  const formatRupiah = (angka) => {
    if (!angka) return '';
    let number_string = angka.toString().replace(/[^,\d]/g, '');
    let split = number_string.split(',');
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    let ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    if (ribuan) {
      let separator = sisa ? '.' : '';
      rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
  };

  useEffect(() => {
    if (value !== undefined && value !== null) {
      const raw = value.toString().replace(/[^,\d]/g, '');
      setRawValue(raw);
      setDisplayValue(formatRupiah(raw));
      if (hiddenInputRef.current) hiddenInputRef.current.value = raw;
    }
  }, [value]);

  const handleDisplayChange = (e) => {
    const raw = e.target.value.replace(/[^,\d]/g, '');
    const formatted = formatRupiah(raw);
    setDisplayValue(formatted);
    setRawValue(raw);
    
    if (hiddenInputRef.current) hiddenInputRef.current.value = raw;
    
    if (onChange) {
      onChange(raw, formatted);
    }
  };

  return (
    <>
      <input
        type="text"
        placeholder={placeholder}
        required={required}
        className={className}
        onChange={handleDisplayChange}
        value={displayValue}
        readOnly={readOnly}
      />
      <input type="hidden" name={name} ref={hiddenInputRef} value={rawValue} />
    </>
  );
}
