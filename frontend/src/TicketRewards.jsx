import React, { useEffect, useState } from 'react';
import { Check, ChevronLeft, ChevronRight, Crown, Gift, Mail, Medal, Send, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Button, CalendarPicker, ImageUpload, Input, Select } from './components';

const previousMonth = () => { const date = new Date(Date.now() + 330 * 60000); date.setUTCDate(1); date.setUTCMonth(date.getUTCMonth() - 1); return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`; };
const monthLabel = month => { const [year, number] = month.split('-').map(Number); return new Date(Date.UTC(year, number - 1, 1)).toLocaleDateString('en-IN', { month: 'long', year: 'numeric', timeZone: 'UTC' }); };
const stepsLabel = value => `${Number(value || 0).toLocaleString()} steps`;

export default function TicketRewards({ api, token, refreshKey }) {
  const [month, setMonth] = useState(previousMonth);
  const [audience, setAudience] = useState('INDIVIDUAL');
  const [leaders, setLeaders] = useState([]);
  const [claims, setClaims] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [phone, setPhone] = useState('');
  const [consentMethod, setConsentMethod] = useState('PHONE');
  const [confirmed, setConfirmed] = useState(false);
  const [bookingReference, setBookingReference] = useState('');
  const [ticketDate, setTicketDate] = useState('');
  const [ticketNumber, setTicketNumber] = useState('');
  const [ticketCount, setTicketCount] = useState('1');
  const [imageFile, setImageFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const selectedClaim = claims.find(claim => claim.id === selectedId) || null;
  const phoneValue = phone || selectedClaim?.contactPhone || '';
  useEffect(() => { setPhone(''); setConfirmed(false); setTicketDate(''); setTicketNumber(''); setBookingReference(''); setTicketCount('1'); setImageFile(null); }, [selectedId]);

  async function load() {
    setBusy(true); setError('');
    try {
      const [ranking, history] = await Promise.all([
        api(`/admin/ticket-rewards/leaderboard?${new URLSearchParams({ month, audience })}`, { token }),
        api(`/admin/ticket-rewards/claims?${new URLSearchParams({ month })}`, { token })
      ]);
      setLeaders(ranking.items || []); setClaims(history.items || []);
      setSelectedId(current => (history.items || []).some(item => item.id === current) ? current : '');
    } catch (cause) { setError(cause.message || 'Could not load monthly leaderboard.'); }
    finally { setBusy(false); }
  }
  useEffect(() => { void load(); }, [month, audience, refreshKey]);

  async function createClaim(winner) {
    setBusy(true); setError(''); setNotice('');
    try {
      const result = await api('/admin/ticket-rewards/claims', { token, body: { month, audience, winnerId: winner.id } });
      setNotice('Winner claim created. Record consent before booking and sending the ticket.');
      await load(); setSelectedId(result.claim.id);
    } catch (cause) { setError(cause.message || 'Could not create winner claim.'); }
    finally { setBusy(false); }
  }
  async function saveConsent(event) {
    event.preventDefault(); setBusy(true); setError(''); setNotice('');
    try {
      const result = await api(`/admin/ticket-rewards/claims/${encodeURIComponent(selectedClaim.id)}/consent`, { token, body: { confirmed, method: consentMethod, phone: phoneValue } });
      setNotice('Consent saved. You can now book the ticket and send its image.'); await load(); setSelectedId(result.claim.id);
    } catch (cause) { setError(cause.message || 'Could not save consent.'); }
    finally { setBusy(false); }
  }
  async function sendTicket(event) {
    event.preventDefault(); if (!imageFile) { setError('Choose the booked ticket image first.'); return; }
    setBusy(true); setError(''); setNotice('');
    try {
      const image = await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('Could not read ticket image.')); reader.readAsDataURL(imageFile); });
      const result = await api(`/admin/ticket-rewards/claims/${encodeURIComponent(selectedClaim.id)}/send`, { token, body: { image, filename: imageFile.name, ticketCount: Number(ticketCount), ticketDate, ticketNumber, bookingReference } });
      setNotice(`Ticket email sent to ${result.claim.recipientEmail}.`); setImageFile(null); await load(); setSelectedId(result.claim.id);
    } catch (cause) { setError(cause.message || 'Could not send ticket email.'); }
    finally { setBusy(false); }
  }
  function changeMonth(offset) {
    const [year, monthNumber] = month.split('-').map(Number);
    const next = new Date(year, monthNumber - 1 + offset, 1);
    const nextValue = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, '0')}`;
    if (nextValue <= previousMonth()) { setSelectedId(''); setMonth(nextValue); }
  }

  const winner = leaders.find(row => row.rank === 1);
  const currentWinnerClaim = winner && claims.find(row => row.audience === audience && row.winnerId === winner.id);
  const statusLabel = status => status === 'CONSENT_PENDING' ? 'Consent needed' : status === 'READY_TO_SEND' ? 'Ready to send' : 'Sent';
  const claimDetail = selectedClaim && <section className="ticket-claim-detail" aria-label="Ticket claim details">
    <div className="ticket-section-heading"><div><span className="eyebrow">WINNER FULFILLMENT</span><h3>{selectedClaim.winnerName}</h3><p>{selectedClaim.audience === 'GROUP' ? `Group · GL ${selectedClaim.recipientName}` : 'Individual winner'} · {stepsLabel(selectedClaim.steps)} · {monthLabel(selectedClaim.month)}</p></div><span className={`ticket-status status-${selectedClaim.status.toLowerCase().replaceAll('_', '-')}`}>{statusLabel(selectedClaim.status)}</span></div>
    <div className="ticket-recipient"><div><Mail size={16}/><span><small>Ticket email recipient</small><strong>{selectedClaim.recipientName} · {selectedClaim.recipientEmail}</strong></span></div>{selectedClaim.consent && <span>Booking phone · {selectedClaim.consent.phone || `ending ${selectedClaim.consent.phoneLast4 || '••••'}`}</span>}</div>
    {selectedClaim.audience === 'GROUP' && selectedClaim.memberSnapshot?.length > 0 && <details className="ticket-member-snapshot"><summary><Users size={15}/> Monthly group activity snapshot · {selectedClaim.memberSnapshot.length} members</summary><div>{selectedClaim.memberSnapshot.map(member => <span key={member.id}><strong>{member.name}</strong><small>{member.role === 'GL' ? 'Group leader' : 'Member'} · {stepsLabel(member.steps)}</small></span>)}</div></details>}
    <div className="ticket-fulfillment-grid">
      <div className="ticket-form-area">
        {!selectedClaim.consent ? <form className="ticket-form" onSubmit={saveConsent}><h4><ShieldCheck size={17}/> Record winner consent</h4><p>{selectedClaim.contactPhone ? 'Saved winner phone and registered email are prefilled.' : 'The winner profile has no saved phone number; enter the verified number received during consent.'} Confirm that the winner permits this number for booking and permits the ticket image to be emailed to their registered address.</p><div className="ticket-form-row"><label>Winner phone number<Input autoComplete="tel" type="tel" value={phoneValue} onChange={event => setPhone(event.target.value)} placeholder="Add phone in winner profile" required/></label><label>Consent received by<Select value={consentMethod} onChange={event => setConsentMethod(event.target.value)}><option value="PHONE">Phone call</option><option value="EMAIL">Email</option><option value="IN_PERSON">In person</option></Select></label></div><label className="ticket-consent-check"><input type="checkbox" checked={confirmed} onChange={event => setConfirmed(event.target.checked)}/><span>I confirm the winner gave permission for ticket booking using this number and for sending the ticket image to the email above.</span></label><Button className="primary" disabled={busy || !confirmed || !phoneValue.trim()}><Check size={16}/>{busy ? 'Saving…' : 'Save consent'}</Button></form> : selectedClaim.status !== 'SENT' ? <form className="ticket-form" onSubmit={sendTicket}><h4><Gift size={17}/> Add booking details</h4><p>Book manually with the approved number, then add the travel or event date and the ticket or PNR number. The selected ticket image is previewed on the right and sent to the registered email.</p><div className="ticket-form-row"><label>Ticket date<CalendarPicker value={ticketDate} onChange={setTicketDate}/></label><label>Ticket / PNR number<Input value={ticketNumber} onChange={event => setTicketNumber(event.target.value)} maxLength={100} placeholder="Enter ticket number" required/></label></div><div className="ticket-form-row"><label>Booking reference <small>(optional)</small><Input value={bookingReference} onChange={event => setBookingReference(event.target.value)} maxLength={120} placeholder="Booking ID"/></label><label>Number of tickets<Input type="number" min="1" max="10" value={ticketCount} onChange={event => setTicketCount(event.target.value)} required/></label></div><Button className="primary" disabled={busy || !imageFile || !ticketDate || !ticketNumber.trim()}>{busy ? 'Sending email…' : <><Mail size={16}/> Email ticket to winner</>}</Button></form> : <div className="ticket-delivery-note"><Check size={17}/><span>Ticket email sent on {new Date(selectedClaim.delivery?.sentAt).toLocaleString()} to {selectedClaim.delivery?.recipientEmail || selectedClaim.recipientEmail}. {selectedClaim.ticketDate && `Ticket date: ${selectedClaim.ticketDate}. `}{selectedClaim.ticketNumber && `Ticket/PNR: ${selectedClaim.ticketNumber}. `}{selectedClaim.delivery?.bookingReference && `Booking reference: ${selectedClaim.delivery.bookingReference}.`}</span></div>}
      </div>
      <div className="ticket-preview-panel" aria-label="Ticket preview">
        <div className="ticket-preview-heading"><span className="eyebrow">EMAIL ATTACHMENT</span><strong>Ticket preview</strong></div>
        {selectedClaim.status !== 'SENT' ? <ImageUpload value={imageFile} onChange={setImageFile} onError={setError} label="Upload ticket image" className="ticket-image-upload"/> : <>{selectedClaim.ticketImage ? <div className="ticket-sent-image"><img src={selectedClaim.ticketImage} alt={`Ticket sent to ${selectedClaim.recipientName}`}/></div> : <div className="ticket-preview-unavailable">Ticket image is unavailable for this older claim.</div>}<div className="ticket-preview-sent"><Check size={16}/><span>The ticket image was sent to the winner’s registered email and saved for their app.</span></div></>}
        <dl className="ticket-preview-meta"><div><dt>Reward month</dt><dd>{monthLabel(selectedClaim.month)}</dd></div><div><dt>Recipient</dt><dd>{selectedClaim.recipientName}</dd></div>{ticketDate && <div><dt>Ticket date</dt><dd>{ticketDate}</dd></div>}{ticketNumber && <div><dt>Ticket / PNR</dt><dd>{ticketNumber}</dd></div>}</dl>
      </div>
    </div>
  </section>;

  return <div className="ticket-rewards-page">
    <section className="ticket-board-card"><div className="ticket-board-toolbar"><div className="ticket-board-copy"><span className="eyebrow">MONTHLY LEADERBOARD</span><h2>Ticket reward winners</h2><p>Choose the completed month’s top individual or group, then record consent and ticket delivery.</p></div><div className="ticket-board-controls"><label className="ticket-month-control"><span>Reward month</span><div className="ticket-month-picker"><Button type="button" className="ticket-month-step" aria-label="Previous reward month" onClick={() => changeMonth(-1)}><ChevronLeft size={16}/></Button><CalendarPicker mode="month" value={month} max={previousMonth()} onChange={nextMonth => { setSelectedId(''); setMonth(nextMonth); }}/><Button type="button" className="ticket-month-step" aria-label="Next reward month" disabled={month >= previousMonth()} onClick={() => changeMonth(1)}><ChevronRight size={16}/></Button></div></label></div></div><div className="ticket-audience-row"><div className="ticket-audience-tabs" role="tablist" aria-label="Winner type"><Button type="button" role="tab" aria-selected={audience === 'INDIVIDUAL'} className={audience === 'INDIVIDUAL' ? 'active' : ''} onClick={() => { setAudience('INDIVIDUAL'); setSelectedId(''); }}><Users size={16}/>Individuals</Button><Button type="button" role="tab" aria-selected={audience === 'GROUP'} className={audience === 'GROUP' ? 'active' : ''} onClick={() => { setAudience('GROUP'); setSelectedId(''); }}><Trophy size={16}/>Groups</Button></div></div>
      {error && <div className="error ticket-error" role="alert">{error}</div>}{notice && <div className="ticket-notice" role="status">{notice}</div>}
      {busy && !leaders.length ? <div className="ticket-empty">Loading leaderboard…</div> : !leaders.length ? <div className="ticket-empty">No {audience === 'GROUP' ? 'groups' : 'users'} are available for this month.</div> : <div className="ticket-winner-layout"><div className="ticket-winner-card"><div className="ticket-winner-ribbon"><Crown size={16}/> MONTH WINNER</div><div className="ticket-winner-avatar">{audience === 'GROUP' ? <Users size={25}/> : (winner?.name || 'U').slice(0, 1).toUpperCase()}</div><h3>{winner?.name}</h3><strong>{stepsLabel(winner?.steps)}</strong><p>{audience === 'GROUP' ? `GL: ${winner?.leaderName || 'Unknown'} · ${winner?.memberCount || 0} members` : winner?.email}</p>{winner && (currentWinnerClaim ? <Button className="primary ticket-winner-action" onClick={() => setSelectedId(currentWinnerClaim.id)}><Send size={15}/>{currentWinnerClaim.status === 'SENT' ? 'View ticket' : 'Send ticket'}</Button> : <Button className="primary ticket-winner-action" disabled={busy} onClick={() => createClaim(winner)}><Gift size={16}/>Create winner claim</Button>)}</div>
        <div className="ticket-ranking-table"><div className="ticket-ranking-title"><div><Trophy size={17}/><strong>{audience === 'GROUP' ? 'Group ranking' : 'Individual ranking'}</strong></div><span>{monthLabel(month)} · {leaders.length} ranked</span></div><div className="ticket-ranking-head"><span>RANK / {audience === 'GROUP' ? 'GROUP' : 'USER'}</span><span>MONTHLY ACTIVITY</span><span>STEPS</span></div>{leaders.map(row => <div className={`ticket-ranking-row ${row.rank === 1 ? 'first' : ''}`} key={row.id}><span className="ticket-rank-number">{row.rank <= 3 ? <Medal size={16}/> : `#${row.rank}`}</span><span className="ticket-rank-identity"><strong>{row.name}</strong><small>{audience === 'GROUP' ? `GL ${row.leaderName || '—'} · ${row.memberCount} members` : row.email}</small></span><span className="ticket-progress"><i style={{ width: `${winner?.steps ? Math.max(2, Math.min(100, row.steps / winner.steps * 100)) : 0}%` }}/></span><strong className="ticket-rank-steps">{stepsLabel(row.steps)}</strong>{row.claimExists && <span className="ticket-claimed">Claim exists</span>}</div>)}</div></div>}
    </section>
    {claimDetail}
    <section className="ticket-history-card"><div className="ticket-section-heading"><div><span className="eyebrow">AUDIT TRAIL</span><h3>Ticket claim history</h3><p>Consent status, recipient, booking reference, and sent image metadata.</p></div><span>{claims.length} claims · {monthLabel(month)}</span></div>{claims.length ? <div className="ticket-history-list">{claims.map(claim => <button type="button" key={claim.id} className={selectedId === claim.id ? 'selected' : ''} onClick={() => { setSelectedId(claim.id); setError(''); setNotice(''); }}><span className="ticket-history-icon">{claim.audience === 'GROUP' ? <Users size={17}/> : <Trophy size={17}/>}</span><span className="ticket-history-name"><strong>{claim.winnerName}</strong><small>{claim.audience === 'GROUP' ? `GL ${claim.recipientName}` : claim.recipientEmail} · {stepsLabel(claim.steps)}</small></span><span className={`ticket-status status-${claim.status.toLowerCase().replaceAll('_', '-')}`}>{statusLabel(claim.status)}</span><ChevronRight size={16}/></button>)}</div> : <div className="ticket-empty compact">No ticket claims have been created for {monthLabel(month)} yet.</div>}</section>
    <p className="ticket-policy-note">Monthly scores add each user's daily de-duplicated steps in IST. Group scores sum current members' monthly activity; the claim stores a member snapshot for audit. Phone numbers are encrypted, masked in this page, and used only for manual booking.</p>
  </div>;
}
