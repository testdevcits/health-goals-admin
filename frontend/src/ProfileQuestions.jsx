import React, { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2, X } from 'lucide-react';
import {Button, Input, Select, Loading, DataTable, SectionHeader} from './components';

const blank = { key: '', label: '', type: 'text', options: '', required: false, order: '' };
const genderOption = value => value === 'Woman' ? 'Female' : value === 'Man' ? 'Male' : value;

export default function ProfileQuestions({ api, token, refreshKey }) {
  const [questions, setQuestions] = useState([]);
  const [form, setForm] = useState(blank);
  const [editingId, setEditingId] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try { const result = await api('/admin/profile-questions', { token }); setQuestions((result.questions || []).map(question => question.key === 'gender' ? { ...question, options: (question.options || []).map(genderOption) } : question)); }
    catch (cause) { setError(cause.message || 'Could not load profile questions.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, [token, refreshKey]);

  const payload = () => ({
    key: form.key.trim().toLowerCase().replace(/\s+/g, '_'),
    label: form.label.trim(), type: form.type,
    options: form.type === 'select' ? form.options.split(',').map(value => value.trim()).filter(Boolean).map(value => form.key.trim().toLowerCase() === 'gender' ? genderOption(value) : value) : [],
    required: form.required, order: form.order === '' ? (questions.length + 1) * 10 : Number(form.order),
  });
  async function save(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const body = payload();
      if (editingId) await api(`/admin/profile-questions/${encodeURIComponent(editingId)}`, { token, method: 'PATCH', body });
      else await api('/admin/profile-questions', { token, method: 'POST', body });
      setForm(blank); setEditingId(''); setFormOpen(false); await load();
    } catch (cause) { setError(cause.message || 'Could not save this question.'); }
    finally { setBusy(false); }
  }
  function edit(question) {
    setEditingId(question.id);
    setFormOpen(true);
    setForm({ key: question.key, label: question.label, type: question.type, options: (question.options || []).join(', '), required: question.required, order: String(question.order) });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  async function toggle(question) {
    setBusy(true); setError('');
    try {
      if (question.active) await api(`/admin/profile-questions/${encodeURIComponent(question.id)}`, { token, method: 'DELETE' });
      else await api(`/admin/profile-questions/${encodeURIComponent(question.id)}`, { token, method: 'PATCH', body: { active: true } });
      await load();
    } catch (cause) { setError(cause.message || 'Could not update this question.'); }
    finally { setBusy(false); }
  }

  return <section className="records-panel profile-questions-panel">
    <SectionHeader className="panel-heading" title="Profile questions" description="Active questions appear to users after sign-in when they have not answered them yet. Answers stay on the user profile." actions={<div className="profile-question-toolbar"><Button className="primary profile-question-add" onClick={() => { setEditingId(''); setForm(blank); setFormOpen(true); }}><Plus size={15}/>Add question</Button></div>}/>
    {formOpen && <form className="profile-question-form" onSubmit={save}>
      <h3>{editingId ? 'Edit question' : 'Add a question'}</h3>
      <div className="profile-question-fields">
        <label>Answer key<Input required disabled={Boolean(editingId)} maxLength={40} value={form.key} onChange={event => setForm(current => ({ ...current, key: event.target.value }))} placeholder="e.g. activity_level"/></label>
        <label>Question shown in app<Input required maxLength={120} value={form.label} onChange={event => setForm(current => ({ ...current, label: event.target.value }))} placeholder="How active are you most days?"/></label>
        <label>Answer type<Select value={form.type} onChange={event => setForm(current => ({ ...current, type: event.target.value }))}><option value="text">Short text</option><option value="number">Number</option><option value="select">Choose an option</option><option value="date">Date (DD/MM/YYYY)</option></Select></label>
        {form.type === 'select' && <label>Options (comma separated)<Input required value={form.options} onChange={event => setForm(current => ({ ...current, options: event.target.value }))} placeholder="Low, Medium, High"/></label>}
        <label>Display order<Input type="number" min="0" max="10000" value={form.order} onChange={event => setForm(current => ({ ...current, order: event.target.value }))} placeholder="Automatic"/></label>
        <label className="profile-question-required"><input type="checkbox" checked={form.required} onChange={event => setForm(current => ({ ...current, required: event.target.checked }))}/> Required to continue</label>
      </div>
      <p className="profile-question-help">Use a new answer key when you need to ask for new information. Existing answers are saved by key and are not erased when questions are edited or deactivated.</p>
      {error && <div className="error" role="alert">{error}</div>}
      <div className="row-actions"><Button className="primary" disabled={busy}>{editingId ? <Pencil size={15}/> : <Plus size={15}/>} {busy ? 'Saving…' : editingId ? 'Save question' : 'Add question'}</Button><Button type="button" className="secondary" onClick={() => { setEditingId(''); setForm(blank); setFormOpen(false); }}><X size={14}/>Cancel</Button></div>
    </form>}
    {!formOpen && (loading ? <Loading label="Loading profile questions…"/> : questions.length === 0 ? <div className="profile-question-empty"><strong>No profile questions yet</strong><span>Add a question to collect profile details from users after sign-in.</span><Button className="secondary" onClick={() => setFormOpen(true)}><Plus size={15}/>Create first question</Button></div> : <DataTable wrapperClassName="table-scroll"><table><thead><tr><th>Question</th><th>Key</th><th>Type</th><th>Required</th><th>Status</th><th/></tr></thead><tbody>{questions.map(question => <tr key={question.id}><td><strong>{question.label}</strong>{question.options?.length > 0 && <small>{question.options.join(' · ')}</small>}</td><td><code>{question.key}</code></td><td>{question.type}</td><td>{question.required ? 'Yes' : 'No'}</td><td><span className={`badge ${question.active ? '' : 'suspended'}`}>{question.active ? 'ACTIVE' : 'INACTIVE'}</span></td><td><div className="row-actions"><Button className="row-action" aria-label={`Edit ${question.label}`} onClick={() => edit(question)}><Pencil size={15}/></Button><Button className="row-action" disabled={busy} aria-label={`${question.active ? 'Deactivate' : 'Activate'} ${question.label}`} onClick={() => void toggle(question)}><Trash2 size={15}/></Button></div></td></tr>)}</tbody></table></DataTable>)}
  </section>;
}
