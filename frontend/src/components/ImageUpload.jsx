import React, { useEffect, useId, useState } from 'react';
import { ImagePlus, X } from 'lucide-react';
import Button from './Button';

const defaultAccept = ['image/png', 'image/jpeg', 'image/webp'];

export default function ImageUpload({
  value = null,
  onChange,
  onError,
  accept = defaultAccept,
  maxBytes = 5 * 1024 * 1024,
  label = 'Upload image',
  helperText,
  disabled = false,
  className = ''
}) {
  const id = useId();
  const [preview, setPreview] = useState('');
  useEffect(() => {
    if (!value) { setPreview(''); return undefined; }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);
  const acceptValue = Array.isArray(accept) ? accept.join(',') : accept;
  const acceptedTypes = Array.isArray(accept) ? accept : accept.split(',').map(item => item.trim());
  function choose(event) {
    const file = event.target.files?.[0] || null;
    if (!file) { onChange?.(null); return; }
    if (!acceptedTypes.includes(file.type)) { onError?.('Choose a PNG, JPEG, or WebP image.'); event.target.value = ''; return; }
    if (file.size > maxBytes) { onError?.(`Image must be ${Math.round(maxBytes / 1024 / 1024)} MB or smaller.`); event.target.value = ''; return; }
    onError?.(''); onChange?.(file);
  }
  const detail = value ? `${value.name} · ${(value.size / 1024 / 1024).toFixed(2)} MB` : helperText || 'PNG, JPEG, or WebP · up to 5 MB';
  return <div className={`hg-image-upload ${className}`.trim()}>
    <div className="hg-image-upload-preview">{preview ? <img src={preview} alt="Selected upload preview" /> : <div><ImagePlus size={25}/><span>No image selected</span></div>}</div>
    <div className="hg-image-upload-actions"><label htmlFor={id}>{label}</label><input id={id} type="file" accept={acceptValue} onChange={choose} disabled={disabled}/>{value && <Button type="button" className="hg-image-upload-remove" disabled={disabled} onClick={() => onChange?.(null)} aria-label="Remove selected image"><X size={14}/>Remove</Button>}</div>
    <small>{detail}</small>
  </div>;
}
